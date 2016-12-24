(function () {

    window.rester = window.rester || {};
    rester.browserRequest = {};


    /**
     * Executes the specified browser request.
     * @param {Object} request - The request object.
     * @param {String} request.url - The url to load in a new tab.
     * @param {String} request.targetUrl - When this matches the URL in the
     * tab, the request is finished the currently executed request is returned.
     * @returns {Promise.<Object>} A promise which gets resolved, when the
     * request was successfully saved and returns the request, which matches
     * the targetUrl.
     */
    rester.browserRequest.send = function (request) {
        return new Promise(function (resolve, reject) {
            let thisTabId,
                requestFinished = false;

            chrome.tabs.create({
                url: request.url
            }, tab => {
                thisTabId = tab.id;

                chrome.tabs.onRemoved.addListener(onTabRemoved);
                chrome.webRequest.onBeforeRequest.addListener(onBeforeRequest, {
                    urls: [request.targetUrl + '*'],
                    types: ['main_frame']
                }, ['blocking']);
            });

            function onTabRemoved(tabId) {
                if (tabId === thisTabId) {
                    chrome.tabs.onRemoved.removeListener(onTabRemoved);
                    chrome.webRequest.onBeforeRequest.removeListener(onBeforeRequest);

                    if (!requestFinished) {
                        reject('Tab was closed, before target url was loaded.');
                    }
                }
            }

            function onBeforeRequest(details) {
                if (details.tabId !== thisTabId) return;

                requestFinished = true;
                chrome.tabs.remove(thisTabId, () => {
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
