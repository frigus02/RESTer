/* jshint node: true */

'use strict';

const self = require('sdk/self'),
      buttons = require('sdk/ui/button/action'),
      tabs = require('sdk/tabs'),
      pageMod = require('sdk/page-mod'),
      customRequest = require('lib/request'),
      customBrowserRequest = require('lib/browser-request'),
      customData = require('lib/data'),
      customFields = require('lib/utils/fields'),
      customSettings = require('lib/settings');

const api = {
    info: {
        get () {
            return {version: self.version};
        }
    },
    request: {
        send (request) {
            return customRequest.send(request);
        },
        sendBrowser (request) {
            return customBrowserRequest.send(request);
        }
    },
    data: customData,
    settings: customSettings
};

buttons.ActionButton({
    id: 'rester',
    label: 'RESTer',
    icon: {
        '18': './images/icon18.png',
        '32': './images/icon32.png',
        '36': './images/icon36.png',
        '64': './images/icon64.png'
    },
    onClick: function () {
        tabs.open({
            url: './site/index.html'
        });
    }
});

pageMod.PageMod({
    include: [
        // Installed extension
        self.data.url('./site/index.html') + '*',
        // Site launched on localhost
        'http://localhost:3000/*',
        'http://127.0.0.1:3000/*'
    ],
    contentScriptFile: './site-content/rester.js',
    contentScriptWhen: 'start',
    attachTo: ['existing', 'top'],
    onAttach: function (worker) {
        function onDataChange(data) {
            worker.port.emit('event', {name: 'dataChange', data});
        }

        function onSettingsChange(data) {
            worker.port.emit('event', {name: 'settingsChange', data});
        }

        customData.on('change', onDataChange);
        customSettings.on('change', onSettingsChange);

        worker.port.on('api.request', function ({id, action, args, fields}) {
            const actionPath = action.split('.'),
                  actionFunc = actionPath.reduce((api, path) => api && api[path], api);

            if (!actionFunc) return;

            Promise.resolve(actionFunc(args))
                .then(function (result) {
                    if (fields) {
                        result = customFields.select(result, fields);
                    }

                    worker.port.emit('api.response', {id, result});
                })
                .catch(function (error) {
                    worker.port.emit('api.response', {id, error});
                });
        });

        worker.on('detach', function () {
            customData.off('change', onDataChange);
            customSettings.off('change', onSettingsChange);
        });
    }
});
