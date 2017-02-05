(function () {
    'use strict';

    if (!chrome.runtime.getBrowserInfo) {
        chrome.runtime.getBrowserInfo = function getBrowserInfoPolyfill(callback) {
            callback({
                name: 'Chrome',
                vendor: 'Google',
                version: '',
                buildID: ''
            });
        };
    }
})();
