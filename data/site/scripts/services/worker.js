'use strict';

angular.module('app')
    .service('$worker', ['$window', '$q', function ($window, $q) {

        function SimpleWorker(workerScript) {
            return {
                run: function (data) {
                    let worker = new $window.Worker(workerScript),
                        dfd = $q.defer(),
                        promise = dfd.promise;

                    worker.onmessage = function (event) {
                        worker.terminate();
                        dfd.resolve(event.data);
                    };

                    worker.onerror = function (error) {
                        worker.terminate();
                        dfd.reject(error);
                    };

                    promise.cancel = function () {
                        worker.terminate();
                    };

                    worker.postMessage(data);

                    return promise;
                }
            };
        }

        function getAbsoluteUrl(relativeUrl) {
            let url = new URL(location.href);
            url.search = '';
            url.hash = '';
            url.pathname = url.pathname.substr(0, url.pathname.lastIndexOf('/')) + '/' + relativeUrl;
            return url.toString();
        }

        SimpleWorker.HighlightCode = new SimpleWorker(getAbsoluteUrl('scripts/workers/highlight-code.js'));

        return SimpleWorker;

    }]);
