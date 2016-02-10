/* jshint node: true */

'use strict';

const self = require('sdk/self'),
      buttons = require('sdk/ui/button/action'),
      tabs = require('sdk/tabs'),
      pageMod = require('sdk/page-mod'),
      customRequest = require('lib/request'),
      customBrowserRequest = require('lib/browser-request');

let api = {
    sendRequest (request) {
        return customRequest.send(request);
    },
    sendBrowserRequest (request) {
        return customBrowserRequest.send(request);
    }
};

buttons.ActionButton({
    id: 'rester',
    label: 'RESTer',
    icon: {
        '16': './images/icon16.png',
        '32': './images/icon32.png',
        '64': './images/icon64.png'
    },
    onClick: function () {
        tabs.open({
            url: './site/index.html'
        });
    }
});

pageMod.PageMod({
    include: self.data.url('./site/index.html') + '*',
    contentScriptFile: './site-content/rester.js',
    attachTo: ['existing', 'top'],
    onAttach: function (worker) {
        worker.port.on('api.request', function ({id, action, args}) {
            api[action](args)
                .then(function (result) {
                    worker.port.emit('api.response', {id, result});
                })
                .catch(function (error) {
                    worker.port.emit('api.response', {id, error});
                });
        });
    }
});
