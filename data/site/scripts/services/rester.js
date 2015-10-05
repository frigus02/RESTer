'use strict';

angular.module('app')
    .service('$rester', ['$window', '$q', '$data', function ($window, $q, $data) {
        var self = this,
            requests = {};

        $window.addEventListener('message', function (event) {
            if (event.origin !== $window.location.origin) return;

            if (event.data.action === 'rester.sendRequestSuccess') {
                requests[event.data.id].resolve(Object.assign(new $data.Response(), event.data.response));
                requests[event.data.id] = undefined;
            } else if (event.data.action === 'rester.sendRequestError') {
                requests[event.data.id].reject(event.data.error);
                requests[event.data.id] = undefined;
            } else if (event.data.action === 'rester.sendBrowserRequestSuccess') {
                requests[event.data.id].resolve(event.data.response);
                requests[event.data.id] = undefined;
            } else if (event.data.action === 'rester.sendBrowserRequestError') {
                requests[event.data.id].reject(event.data.error);
                requests[event.data.id] = undefined;
            }
        });

        self.sendRequest = function (request) {
            var dfd = $q.defer(),
                id = Math.random();

            requests[id] = dfd;

            $window.postMessage({
                action: 'rester.sendRequest',
                id: id,
                request: request
            }, $window.location.origin);

            return dfd.promise;
        };

        self.sendBrowserRequest = function (request) {
            var dfd = $q.defer(),
                id = Math.random();

            requests[id] = dfd;

            $window.postMessage({
                action: 'rester.sendBrowserRequest',
                id: id,
                request: request
            }, $window.location.origin);

            return dfd.promise;
        };
    }]);
