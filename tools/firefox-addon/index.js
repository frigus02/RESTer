const webExtension = require('sdk/webextension');

const customSettings = require('lib/settings');
const customData = require('lib/data');

webExtension.startup().then(api => {
    const {browser} = api;

    browser.runtime.onConnect.addListener(port => {
        if (port.name !== 'migration-from-legacy-addon') return;

        port.onMessage.addListener(message => {
            if (message === 'delete') {
                customData.delete();
                customSettings.delete();
            }
        });

        customData.get().then(data => {
            // Delete IDs from entities. Otherwise they cannot be imported.
            Object.keys(data).forEach(objectStore => {
                for (let entity of data[objectStore]) {
                    delete entity.id;
                }
            });

            const settings = customSettings.get();
            port.postMessage({settings, data});
        });
    });
});
