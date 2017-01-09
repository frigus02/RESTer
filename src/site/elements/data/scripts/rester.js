(function () {

    const self = RESTer.register('rester', ['eventListeners']),
          port = chrome.runtime.connect(),
          requests = {},
          settingsKeys = ['activeEnvironment', 'stripDefaultHeaders', 'enableRequestLintInspections', 'pinSidenav', 'openOAuth2LoginsInIncognitoWindow'],
          cachedSettings = {};

    port.onMessage.addListener(message => {
        if (message.action === 'apiresponse') {
            if (message.error) {
                requests[message.id].reject(message.error && JSON.parse(message.error));
            } else {
                requests[message.id].resolve(message.result && JSON.parse(message.result));
            }

            requests[message.id] = undefined;
        } else if (message.action.startsWith('event.')) {
            const eventName = message.action.split('.')[1],
                  args = message.args && JSON.parse(message.args);

            if (eventName === 'settingsChange' && cachedSettings) {
                Object.assign(cachedSettings, args);
            }

            self.fireEvent(eventName, args);
        }
    });

    function sendApiRequest(action, args, fields) {
        return new Promise((resolve, reject) => {
            const id = Math.random();

            requests[id] = {resolve, reject};

            port.postMessage({
                id,
                action: 'api.' + action,
                args: JSON.stringify(args),
                fields
            });
        });
    }


    /*
    * Info
    */

    self.getInfo = function () {
        return sendApiRequest('info.get');
    };


    /*
    * Requests
    */

    self.sendRequest = function (request) {
        return sendApiRequest('request.send', request);
    };

    self.sendBrowserRequest = function (request) {
        return sendApiRequest('request.sendBrowser', request);
    };


    /*
    * Data
    */

    self.putRequest = function (request) {
        return sendApiRequest('data.requests.put', request);
    };

    self.getRequest = function (id, fields) {
        return sendApiRequest('data.requests.get', id, fields);
    };

    self.getRequests = function (fields) {
        return sendApiRequest('data.requests.query', null, fields);
    };

    self.getRequestCollections = function () {
        return sendApiRequest('data.requests.queryCollections');
    };

    self.deleteRequest = function (id) {
        return sendApiRequest('data.requests.delete', id);
    };

    self.addHistoryEntry = function (entry) {
        return sendApiRequest('data.history.add', entry);
    };

    self.getHistoryEntry = function (id, fields) {
        return sendApiRequest('data.history.get', id, fields);
    };

    self.getHistoryEntries = function (top, fields) {
        return sendApiRequest('data.history.query', top, fields);
    };

    self.deleteHistoryEntry = function (id) {
        return sendApiRequest('data.history.delete', id);
    };

    self.putAuthorizationProviderConfiguration = function (config) {
        return sendApiRequest('data.authorizationProviderConfigurations.put', config);
    };

    self.getAuthorizationProviderConfigurations = function (providerId, fields) {
        return sendApiRequest('data.authorizationProviderConfigurations.query', providerId, fields);
    };

    self.deleteAuthorizationProviderConfiguration = function (id) {
        return sendApiRequest('data.authorizationProviderConfigurations.delete', id);
    };

    self.addAuthorizationToken = function (token) {
        return sendApiRequest('data.authorizationTokens.add', token);
    };

    self.getAuthorizationTokens = function (fields) {
        return sendApiRequest('data.authorizationTokens.query', null, fields);
    };

    self.deleteAuthorizationToken = function (id) {
        return sendApiRequest('data.authorizationTokens.delete', id);
    };

    self.putEnvironment = function (environment) {
        return sendApiRequest('data.environments.put', environment);
    };

    self.getEnvironment = function (id, fields) {
        return sendApiRequest('data.environments.get', id, fields);
    };

    self.getEnvironments = function (fields) {
        return sendApiRequest('data.environments.query', null, fields);
    };

    self.deleteEnvironment = function (id) {
        return sendApiRequest('data.environments.delete', id);
    };

    self.importData = function (data) {
        return sendApiRequest('data.import', data);
    };


    /*
    * Settings
    */

    self.settings = {};

    settingsKeys.forEach(key => {
        Object.defineProperty(self.settings, key, {
            get: function () {
                return cachedSettings[key];
            },
            set: function (newValue) {
                cachedSettings[key] = newValue;
                sendApiRequest('settings.set', {
                    [key]: newValue
                });
            },
            enumerable: true
        });
    });

    self.settingsLoaded = new Promise(resolve => {
        sendApiRequest('settings.get').then(settings => {
            Object.assign(cachedSettings, settings);
            resolve();
        });
    });

})();
