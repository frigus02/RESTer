import CustomEventTarget from '../../../../shared/custom-event-target.js';

export const e = new CustomEventTarget();

const port = chrome.runtime.connect({ name: 'api' });
const requests = {};
const settingsKeys = [
    'activeEnvironment',
    'stripDefaultHeaders',
    'enableRequestLintInspections',
    'pinSidenav',
    'requestBodyFullSize',
    'responseBodyWrap',
    'responseBodyPrettyPrint',
    'responseBodyFullSize',
    'responseBodyPreview',
    'showVariablesOnSide',
    'requestPageFullWidth',
    'theme',
];
const cachedSettings = {};

port.onMessage.addListener((message) => {
    if (message.action === 'apiresponse') {
        if (message.error) {
            requests[message.id].reject(
                message.error && JSON.parse(message.error),
            );
        } else {
            requests[message.id].resolve(
                message.result && JSON.parse(message.result),
            );
        }

        requests[message.id] = undefined;
    } else if (message.action.startsWith('event.')) {
        const eventName = message.action.split('.')[1];
        const detail = message.detail && JSON.parse(message.detail);

        if (eventName === 'settingsChange' && cachedSettings) {
            Object.assign(cachedSettings, detail);
        }

        e.dispatchEvent(new CustomEvent(eventName, { detail }));
    }
});

function sendApiRequest(action, args, fields) {
    return new Promise((resolve, reject) => {
        const id = Math.random();

        requests[id] = { resolve, reject };

        port.postMessage({
            id,
            action: 'api.' + action,
            args: JSON.stringify(args),
            fields,
        });
    });
}

/*
 * Data
 */

export function putRequest(request) {
    return sendApiRequest('data.requests.put', request);
}

export function getRequest(id, fields) {
    return sendApiRequest('data.requests.get', id, fields);
}

export function getRequests(fields) {
    return sendApiRequest('data.requests.query', null, fields);
}

export function getRequestCollections() {
    return sendApiRequest('data.requests.queryCollections');
}

export function deleteRequest(id) {
    return sendApiRequest('data.requests.delete', id);
}

export function addHistoryEntry(entry) {
    return sendApiRequest('data.history.add', entry);
}

export function getHistoryEntry(id, fields) {
    return sendApiRequest('data.history.get', id, fields);
}

export function getHistoryEntries(top, fields) {
    return sendApiRequest('data.history.query', top, fields);
}

export function deleteHistoryEntries(ids) {
    return sendApiRequest('data.history.delete', ids);
}

export function putAuthorizationProviderConfiguration(config) {
    return sendApiRequest(
        'data.authorizationProviderConfigurations.put',
        config,
    );
}

export function getAuthorizationProviderConfigurations(providerId, fields) {
    return sendApiRequest(
        'data.authorizationProviderConfigurations.query',
        providerId,
        fields,
    );
}

export function deleteAuthorizationProviderConfiguration(id) {
    return sendApiRequest(
        'data.authorizationProviderConfigurations.delete',
        id,
    );
}

export function addAuthorizationToken(token) {
    return sendApiRequest('data.authorizationTokens.add', token);
}

export function getAuthorizationTokens(fields) {
    return sendApiRequest('data.authorizationTokens.query', null, fields);
}

export function deleteAuthorizationToken(id) {
    return sendApiRequest('data.authorizationTokens.delete', id);
}

export function putEnvironment(environment) {
    return sendApiRequest('data.environments.put', environment);
}

export function getEnvironment(id, fields) {
    return sendApiRequest('data.environments.get', id, fields);
}

export function getEnvironments(fields) {
    return sendApiRequest('data.environments.query', null, fields);
}

export function deleteEnvironment(id) {
    return sendApiRequest('data.environments.delete', id);
}

export function exportData(options) {
    return sendApiRequest('exportImport.export', options);
}

export function importData(options) {
    return sendApiRequest('exportImport.import', options);
}

/*
 * Settings
 */

export const settings = {};

settingsKeys.forEach((key) => {
    Object.defineProperty(settings, key, {
        get: function () {
            return cachedSettings[key];
        },
        set: function (newValue) {
            cachedSettings[key] = newValue;
            sendApiRequest('settings.set', {
                [key]: newValue,
            });
        },
        enumerable: true,
    });
});

export const settingsLoaded = new Promise((resolve) => {
    sendApiRequest('settings.get').then((settings) => {
        Object.assign(cachedSettings, settings);
        resolve();
    });
});
