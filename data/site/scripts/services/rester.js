'use strict';

angular.module('app')
    .service('$rester', ['$window', '$q', function ($window, $q) {
        let self = this,
            requests = {};

        $window.addEventListener('message', function (event) {
            if (event.origin !== $window.location.origin) return;

            if (event.data.type === 'rester.api.response') {
                if (event.data.error) {
                    requests[event.data.id].reject(event.data.error);
                } else {
                    requests[event.data.id].resolve(event.data.result);
                }

                requests[event.data.id] = undefined;
            }
        });

        function sendResterApiRequest(action, args) {
            let dfd = $q.defer(),
                id = Math.random();

            requests[id] = dfd;

            $window.postMessage({
                type: 'rester.api.request',
                id,
                action,
                args
            }, $window.location.origin);

            return dfd.promise;
        }

        self.sendRequest = function (request) {
            return sendResterApiRequest('sendRequest', request);
        };

        self.sendBrowserRequest = function (request) {
            return sendResterApiRequest('sendBrowserRequest', request);
        };
    }]);
