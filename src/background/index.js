(function () {
    'use strict';

    const api = {
        info: {
            get() {
                return chrome.runtime.getManifest();
            }
        },
        request: {
            send(request) {
                return rester.request.send(request);
            },
            sendBrowser(request) {
                return rester.browserRequest.send(request);
            }
        },
        data: rester.data,
        settings: rester.settings
    };

    chrome.browserAction.onClicked.addListener(() => {
        chrome.tabs.create({
            url: chrome.extension.getURL('site/index.html')
        });
    });

    chrome.runtime.onConnect.addListener(port => {
        if (port.name !== 'api') {
            return;
        }

        function onDataChange(args) {
            port.postMessage({action: 'event.dataChange', args: JSON.stringify(args)});
        }

        function onSettingsChange(args) {
            port.postMessage({action: 'event.settingsChange', args: JSON.stringify(args)});
        }

        rester.data.onChange.addListener(onDataChange);
        rester.settings.onChange.addListener(onSettingsChange);

        port.onMessage.addListener(({id, action, args, fields}) => {
            if (!action.startsWith('api.')) {
                return;
            }

            const actionPath = action.split('.');
            const actionFunc = actionPath.reduce((api, path) => api && api[path], {api});

            if (!actionFunc) {
                return;
            }

            Promise.resolve(actionFunc(args && JSON.parse(args)))
                .then(result => {
                    if (fields) {
                        result = rester.utils.fields.select(result, fields);
                    }

                    port.postMessage({id, action: 'apiresponse', result: JSON.stringify(result)});
                })
                .catch(error => {
                    if (error.message) {
                        error = error.message;
                    }

                    port.postMessage({id, action: 'apiresponse', error: JSON.stringify(error)});
                });
        });

        port.onDisconnect.addListener(() => {
            rester.data.onChange.removeListener(onDataChange);
            rester.settings.onChange.removeListener(onSettingsChange);
        });
    });


    // Migration from legacy addon

    if (chrome.runtime.getBrowserInfo) {
        chrome.runtime.getBrowserInfo(browserInfo => {
            if (browserInfo.name === 'Firefox') {
                migrateFromLegacyAddon();
            }
        });
    }

    function migrateFromLegacyAddon() {
        const port = chrome.runtime.connect({name: 'migration-from-legacy-addon'});
        port.onMessage.addListener(message => {
            const imports = [];
            if (Object.keys(message.settings).length > 0) {
                imports.push(api.settings.set(message.settings));
            }

            if (Object.keys(message.data).length > 0) {
                imports.push(api.data.utils.import(message.data));
            }

            if (imports.length === 0) {
                port.disconnect();
            } else {
                Promise.all(imports).then(() => {
                    port.postMessage('delete');
                    port.disconnect();
                });
            }
        });
    }
})();
