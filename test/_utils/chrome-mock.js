(function () {
    'use strict';

    window.chrome = {
        webRequest: {
            onBeforeSendHeaders: {
                addListener() {
                }
            }
        },
        runtime: {
            connect() {
                return {
                    onMessage: {
                        addListener() {
                        }
                    },
                    postMessage() {
                    }
                };
            }
        },
        tabs: {
            getCurrent(callback) {
                callback({
                    id: 42
                });
            }
        }
    };
})();
