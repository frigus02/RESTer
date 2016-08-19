'use strict';

angular.module('app')
    .service('$rester', ['$window', '$q', function ($window, $q) {
        const self = this,
              requests = {},
              eventListeners = {};

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

        self.deleteRequest = function (request) {
            return sendResterApiRequest('data.requests.delete', request);
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

        self.deleteHistoryEntry = function (entry) {
            return sendResterApiRequest('data.history.delete', entry);
        };

        self.putAuthorizationProviderConfiguration = function (config) {
            return sendResterApiRequest('data.authorizationProviderConfigurations.put', config);
        };

        self.getAuthorizationProviderConfigurations = function (providerId, fields) {
            return sendResterApiRequest('data.authorizationProviderConfigurations.query', providerId, fields);
        };

        self.deleteAuthorizationProviderConfiguration = function (config) {
            return sendResterApiRequest('data.authorizationProviderConfigurations.delete', config);
        };

        self.addAuthorizationToken = function (token) {
            return sendResterApiRequest('data.authorizationTokens.add', token);
        };

        self.getAuthorizationTokens = function (fields) {
            return sendResterApiRequest('data.authorizationTokens.query', null, fields);
        };

        self.deleteAuthorizationToken = function (token) {
            return sendResterApiRequest('data.authorizationTokens.delete', token);
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

        self.deleteEnvironment = function (environment) {
            return sendResterApiRequest('data.environments.delete', environment);
        };

        self.importData = function (data) {
            return sendResterApiRequest('data.import', data);
        };

    }]);
