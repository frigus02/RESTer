function ensureIncognitoAccess() {
    return new Promise((resolve, reject) => {
        chrome.extension.isAllowedIncognitoAccess(isAllowed => {
            if (isAllowed) {
                resolve();
            } else {
                reject(
                    "RESTer doesn't have access to incognito windows. Please allow access on the browser extension page and try again."
                );
            }
        });
    });
}

function getCookieStoreId(tab) {
    return new Promise((resolve, reject) => {
        if (tab.cookieStoreId) {
            resolve(tab.cookieStoreId);
        } else {
            chrome.cookies.getAllCookieStores(stores => {
                const store = stores.find(s => s.tabIds.includes(tab.id));
                if (store) {
                    resolve(store.id);
                } else {
                    reject();
                }
            });
        }
    });
}

export function getMatchPatterns(url) {
    const patterns = [];

    const parsedUrl = new URL(url);
    parsedUrl.pathname += '*';
    patterns.push(parsedUrl.toString());

    // Firefox has a bug, which causes it to match urls with ports as if they
    // had no port at all: https://bugzilla.mozilla.org/show_bug.cgi?id=1362809
    // Workaround:
    // - This detects a port in the url and adds another match pattern without
    //   the port.
    // - The onBeforeRequest listener checks manually the current url to make
    //   sure it only accepts urls with the correct port.
    if (parsedUrl.port) {
        parsedUrl.port = '';
        patterns.push(parsedUrl.toString());
    }

    return patterns;
}

function sendRequest(request) {
    return new Promise(function(resolve, reject) {
        const urlMatchPatterns = getMatchPatterns(request.targetUrl);
        let thisWindowId,
            thisTab,
            requestFinished = false;

        chrome.windows.create(
            {
                url: request.url,
                incognito: request.incognito
            },
            window => {
                thisWindowId = window.id;
                thisTab = window.tabs[0];

                chrome.windows.onRemoved.addListener(onWindowRemoved);
                chrome.webRequest.onBeforeRequest.addListener(
                    onBeforeRequest,
                    {
                        urls: urlMatchPatterns,
                        types: ['main_frame'],
                        tabId: thisTab.id
                    },
                    ['blocking']
                );
            }
        );

        function onWindowRemoved(windowId) {
            if (windowId === thisWindowId) {
                chrome.windows.onRemoved.removeListener(onWindowRemoved);
                chrome.webRequest.onBeforeRequest.removeListener(
                    onBeforeRequest
                );

                if (!requestFinished) {
                    reject('Window was closed before target url was loaded.');
                }
            }
        }

        function onBeforeRequest(details) {
            if (!details.url.startsWith(request.targetUrl)) {
                return {};
            }

            if (request.extractCookies) {
                getCookieStoreId(thisTab)
                    .then(storeId => {
                        chrome.cookies.getAll(
                            {
                                url: request.url,
                                storeId: storeId
                            },
                            cookies => {
                                closeWindow(null, {
                                    url: details.url,
                                    cookies: cookies
                                });
                            }
                        );
                    })
                    .catch(() => {
                        closeWindow('Could not find cookie store.');
                    });
            } else {
                closeWindow(null, {
                    url: details.url
                });
            }

            return {
                cancel: true
            };
        }

        function closeWindow(error, result) {
            requestFinished = true;
            chrome.windows.remove(thisWindowId, () => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        }
    });
}

/**
 * Executes the specified browser request.
 * @param {Object} request - The request object.
 * @param {String} request.url - The url to load in a new tab.
 * @param {String} request.targetUrl - When this matches the URL in the
 *     tab, the request is finished the currently executed request is
 *     returned.
 * @param {Boolean} request.incognito - Open url in incognito tab.
 * @param {Boolean} request.extractCookies - Extract cookies after targetUrl
 *     was reached. If set, the result onject will contain a cookies array.
 * @returns {Promise.<Object>} A promise which gets resolved, when the
 *     request was successfully saved and returns the request, which
 *     matches the targetUrl.
 */
export async function send(request) {
    if (request.incognito) {
        await ensureIncognitoAccess();
    }

    return await sendRequest(request);
}
