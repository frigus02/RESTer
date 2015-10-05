'use strict';

const tabs = require('sdk/tabs'),
      tabUtils = require('sdk/tabs/utils'),
      events = require('sdk/system/events'),
      { modelFor } = require('sdk/model/core'),
      { Ci, Cr } = require('chrome');


function getTabForModifyRequestEvent(subject) {
    let loadContext;
    try {
        let httpChannel = subject.QueryInterface(Ci.nsIHttpChannel),
            interfaceRequestor = httpChannel.notificationCallbacks.QueryInterface(Ci.nsIInterfaceRequestor);
        try {
            loadContext = interfaceRequestor.getInterface(Ci.nsILoadContext);
        } catch (e1) {
            try {
                loadContext = subject.loadGroup.notificationCallbacks.getInterface(Ci.nsILoadContext);
            } catch (e2) {}
        }
    } catch (e0) {}

    if (!loadContext) {
        // No load context, which probably means that it's loading an ajax call or like a google ad thing.
        return null;
    } else {
        let browser = loadContext.topFrameElement,
            tab = tabUtils.getTabForBrowser(browser);

        return modelFor(tab);
    }
}


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
exports.send = function (request) {
    return new Promise(function (resolve, reject) {
        let thisTab,
            requestFinished = false;

        tabs.open({
            url: request.url,
            inNewWindow: true,
            onOpen: function (tab) {
                events.on('http-on-modify-request', listener);

                thisTab = tab;
            },
            onClose: function () {
                events.off('http-on-modify-request', listener);

                if (!requestFinished) {
                    reject('Tab was closed, before target url was loaded.');
                }
            }
        });

        function listener(event) {
            let tab = getTabForModifyRequestEvent(event.subject),
                httpChannel = event.subject.QueryInterface(Ci.nsIHttpChannel),
                uri = httpChannel.URI.spec;

            if (tab === thisTab && uri.indexOf(request.targetUrl) === 0) {
                httpChannel.cancel(Cr.NS_BINDING_ABORTED);

                requestFinished = true;
                thisTab.close(function () {
                    resolve({
                        url: uri
                    });
                });
            }
        }

    });
};
