(function () {
    'use strict';

    window.rester = window.rester || {};
    rester.browserRequest = {};


    /**
     * Executes the specified browser request.
     * @param {Object} request - The request object.
     * @param {String} request.url - The url to load in a new tab.
     * @param {String} request.targetUrl - When this matches the URL in the
     *     tab, the request is finished the currently executed request is
     *     returned.
     * @param {Boolean} request.incognito - Open url in incognito tab.
     * @returns {Promise.<Object>} A promise which gets resolved, when the
     *     request was successfully saved and returns the request, which
     *     matches the targetUrl.
     */
    rester.browserRequest.send = function (request) {
        return new Promise(function (resolve, reject) {
            let thisWindowId,
                thisTabId,
                requestFinished = false;

            chrome.windows.create({
                url: request.url,
                incognito: request.incognito
            }, window => {
                thisWindowId = window.id;
                thisTabId = window.tabs[0].id;

                chrome.windows.onRemoved.addListener(onWindowRemoved);
                chrome.webRequest.onBeforeRequest.addListener(onBeforeRequest, {
                    urls: [request.targetUrl + '*'],
                    types: ['main_frame']
                }, ['blocking']);
            });

            function onWindowRemoved(windowId) {
                if (windowId === thisWindowId) {
                    chrome.windows.onRemoved.removeListener(onWindowRemoved);
                    chrome.webRequest.onBeforeRequest.removeListener(onBeforeRequest);

                    if (!requestFinished) {
                        reject('Window was closed before target url was loaded.');
                    }
                }
            }

            function onBeforeRequest(details) {
                if (details.tabId !== thisTabId) {
                    return;
                }

                requestFinished = true;
                chrome.windows.remove(thisWindowId, () => {
                    resolve({
                        url: details.url
                    });
                });

                return {
                    cancel: true
                };
            }
        });
    };
})();
