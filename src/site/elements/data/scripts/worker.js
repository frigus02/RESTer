(function () {
    'use strict';

    const self = RESTer.register('worker');

    class SimpleWorker {
        constructor(workerScript) {
            this.workerScript = workerScript;
        }

        run(data) {
            const worker = new Worker(this.workerScript);
            const promise = new Promise((resolve, reject) => {
                worker.onmessage = function (event) {
                    worker.terminate();
                    resolve(event.data);
                };

                worker.onerror = function (error) {
                    worker.terminate();
                    reject(error);
                };
            });

            promise.cancel = function () {
                worker.terminate();
            };

            worker.postMessage(data);

            return promise;
        }
    }

    function getAbsoluteUrl(relativeUrl) {
        let url = new URL(location.href);
        url.search = '';
        url.hash = '';
        url.pathname = url.pathname.substr(0, url.pathname.lastIndexOf('/')) + '/' + relativeUrl;
        return url.toString();
    }

    self.FormatCode = new SimpleWorker(getAbsoluteUrl('elements/data/workers/format-code.js'));
})();
