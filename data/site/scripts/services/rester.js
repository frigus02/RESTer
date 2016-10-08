'use strict';

angular.module('app')
    .service('$rester', ['$window', '$q', function ($window, $q) {
        const self = this,
              requests = {},
              eventListeners = {},
              settingsKeys = ['activeEnvironment', 'stripDefaultHeaders', 'enableRequestLintInspections', 'pinSidenav', 'experimentalResponseHighlighting'],
              cachedSettings = {};

        $window.addEventListener('message', function (event) {
            if (event.origin !== $window.location.origin) return;

            if (event.data.type === 'rester.api.response') {
                if (event.data.error) {
                    requests[event.data.id].reject(event.data.error);
                } else {
                    requests[event.data.id].resolve(event.data.result);
                }

                requests[event.data.id] = undefined;
            } else if (event.data.type === 'rester.event') {
                if (event.data.name === 'settingsChange' && cachedSettings) {
                    Object.assign(cachedSettings, event.data.data);
                }

                const listeners = eventListeners[event.data.name] || [];
                listeners.forEach(l => l(event.data.data));
            }
        });

        function sendResterApiRequest(action, args, fields) {
            const dfd = $q.defer(),
                  id = Math.random();

            requests[id] = dfd;

            $window.postMessage({
                type: 'rester.api.request',
                id,
                action,
                args,
                fields
            }, $window.location.origin);

            return dfd.promise;
        }

        self.addEventListener = function (eventName, listener) {
            if (!eventListeners[eventName]) {
                eventListeners[eventName] = [];
            }

            eventListeners[eventName].push(listener);
        };


        /*
        * Info
        */

        self.getInfo = function () {
            return sendResterApiRequest('info.get');
        };


        /*
        * Requests
        */

        self.sendRequest = function (request) {
            return sendResterApiRequest('request.send', request);
        };

        self.sendBrowserRequest = function (request) {
            return sendResterApiRequest('request.sendBrowser', request);
        };


        /*
        * Data
        */

        self.putRequest = function (request) {
            return sendResterApiRequest('data.requests.put', request);
        };

        self.getRequest = function (id, fields) {
            return sendResterApiRequest('data.requests.get', id, fields);
        };

        self.getRequests = function (fields) {
            return sendResterApiRequest('data.requests.query', null, fields);
        };

        self.getRequestCollections = function () {
            return sendResterApiRequest('data.requests.queryCollections');
        };

        self.deleteRequest = function (id) {
            return sendResterApiRequest('data.requests.delete', id);
        };

        self.addHistoryEntry = function (entry) {
            return sendResterApiRequest('data.history.add', entry);
        };

        self.getHistoryEntry = function (id, fields) {
            return sendResterApiRequest('data.history.get', id, fields);
        };

        self.getHistoryEntries = function (top, fields) {
            return sendResterApiRequest('data.history.query', top, fields);
        };

        self.deleteHistoryEntry = function (id) {
            return sendResterApiRequest('data.history.delete', id);
        };

        self.putAuthorizationProviderConfiguration = function (config) {
            return sendResterApiRequest('data.authorizationProviderConfigurations.put', config);
        };

        self.getAuthorizationProviderConfigurations = function (providerId, fields) {
            return sendResterApiRequest('data.authorizationProviderConfigurations.query', providerId, fields);
        };

        self.deleteAuthorizationProviderConfiguration = function (id) {
            return sendResterApiRequest('data.authorizationProviderConfigurations.delete', id);
        };

        self.addAuthorizationToken = function (token) {
            return sendResterApiRequest('data.authorizationTokens.add', token);
        };

        self.getAuthorizationTokens = function (fields) {
            return sendResterApiRequest('data.authorizationTokens.query', null, fields);
        };

        self.deleteAuthorizationToken = function (id) {
            return sendResterApiRequest('data.authorizationTokens.delete', id);
        };

        self.putEnvironment = function (environment) {
            return sendResterApiRequest('data.environments.put', environment);
        };

        self.getEnvironment = function (id, fields) {
            return sendResterApiRequest('data.environments.get', id, fields);
        };

        self.getEnvironments = function (fields) {
            return sendResterApiRequest('data.environments.query', null, fields);
        };

        self.deleteEnvironment = function (id) {
            return sendResterApiRequest('data.environments.delete', id);
        };

        self.importData = function (data) {
            return sendResterApiRequest('data.import', data);
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
                    sendResterApiRequest('settings.set', {
                        [key]: newValue
                    });
                },
                enumerable: true
            });
        });

        self.settingsLoaded = $q(resolve => {
            sendResterApiRequest('settings.get').then(settings => {
                Object.assign(cachedSettings, settings);
                resolve();
            });
        });

    }]);
