import db from './data/utils/db.js';
import * as authorizationProviderConfigurations from './data/authorization-provider-configurations.js';
import * as authorizationTokens from './data/authorization-tokens.js';
import * as environments from './data/environments.js';
import * as history from './data/history.js';
import * as requests from './data/requests.js';
import * as settings from './settings/index.js';
import { select } from './utils/fields.js';

// WARNING: The variable name "resterApi" is configured as reserved for UglifyJS.
// Do not change this name here without changing it in the webpack config.
const resterApi = {
    data: {
        authorizationProviderConfigurations: {
            put: authorizationProviderConfigurations.putAuthorizationProviderConfiguration,
            query: authorizationProviderConfigurations.queryAuthorizationProviderConfigurations,
            delete: authorizationProviderConfigurations.deleteAuthorizationProviderConfiguration
        },
        authorizationTokens: {
            add: authorizationTokens.addAuthorizationToken,
            query: authorizationTokens.queryAuthorizationTokens,
            delete: authorizationTokens.deleteAuthorizationToken
        },
        environments: {
            put: environments.putEnvironment,
            get: environments.getEnvironment,
            query: environments.queryEnvironments,
            delete: environments.deleteEnvironment
        },
        history: {
            add: history.addHistoryEntry,
            get: history.getHistoryEntry,
            query: history.queryHistoryEntries,
            delete: history.deleteHistoryEntries
        },
        requests: {
            put: requests.putRequest,
            get: requests.getRequest,
            query: requests.queryRequests,
            queryCollections: requests.queryRequestCollections,
            delete: requests.deleteRequest
        }
    },
    settings: {
        get: settings.get,
        set: settings.set
    }
};

chrome.browserAction.onClicked.addListener(() => {
    chrome.tabs.create({
        url: chrome.extension.getURL('site/index.html')
    });
});

chrome.runtime.onConnect.addListener(port => {
    if (port.name !== 'api') {
        return;
    }

    function onDataChange(event) {
        port.postMessage({action: 'event.dataChange', detail: JSON.stringify(event.detail)});
    }

    function onDataSlowPerformance(event) {
        port.postMessage({action: 'event.dataSlowPerformance', detail: JSON.stringify(event.detail)});
    }

    function onSettingsChange(event) {
        port.postMessage({action: 'event.settingsChange', detail: JSON.stringify(event.detail)});
    }

    db.addEventListener('change', onDataChange);
    db.addEventListener('slowPerformance', onDataSlowPerformance);
    settings.e.addEventListener('change', onSettingsChange);

    port.onMessage.addListener(({id, action, args, fields}) => {
        if (!action.startsWith('api.')) {
            return;
        }

        const actionPath = action.split('.').slice(1);
        const actionFunc = actionPath.reduce((api, path) => api && api[path], resterApi);
        if (!actionFunc) {
            return;
        }

        Promise.resolve(actionFunc(args && JSON.parse(args)))
            .then(result => {
                if (result && fields) {
                    result = select(result, fields);
                }

                port.postMessage({id, action: 'apiresponse', result: JSON.stringify(result)});
            })
            .catch(error => {
                if (error.message) {
                    error = error.message;
                }

                port.postMessage({id, action: 'apiresponse', error: JSON.stringify(error)});
            });
    });

    port.onDisconnect.addListener(() => {
        db.removeEventListener('change', onDataChange);
        db.removeEventListener('slowPerformance', onDataSlowPerformance);
        settings.e.removeEventListener('change', onSettingsChange);
    });
});
