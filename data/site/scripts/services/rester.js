'use strict';

angular.module('app')
    .service('$rester', ['$window', function ($window) {
        var self = this;
        var requests = {};

        $window.addEventListener('message', function(event) {
            if (event.origin !== RESTer.origin) return;

            if (event.data.action === RESTer.actions.loadSuccess) {
                requests[event.data.id].resolve(event.data.response);
                requests[event.data.id] = undefined;
            } else if (event.data.action === RESTer.actions.loadError) {
                requests[event.data.id].reject(event.data.error);
                requests[event.data.id] = undefined;
            }
        });

        self.load = function (request) {
            var id = Math.random();

            return new Promise(function(resolve, reject) {
                requests[id] = {
                    resolve,
                    reject
                };

                $window.postMessage({
                    action: RESTer.actions.load,
                    id: id,
                    request: request
                }, RESTer.origin);
            });
        };
    }]);