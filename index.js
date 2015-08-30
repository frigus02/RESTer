const self = require('sdk/self');
const buttons = require('sdk/ui/button/action');
const tabs = require('sdk/tabs');
const pageMod = require('sdk/page-mod');
const customRequest = require('lib/request');
const customBrowserRequest = require('lib/browser-request');


buttons.ActionButton({
    id: 'rester',
    label: 'RESTer',
    icon: {
        '16': './images/icon16.png',
        '32': './images/icon32.png',
        '64': './images/icon64.png'
    },
    onClick: function (state) {
        tabs.open({
            url: './site/index.html'
        });
    }
});

pageMod.PageMod({
    include: self.data.url('./site/index.html') + '*',
    contentScriptFile: './site-content/rester.js',
    attachTo: ['existing', 'top'],
    onAttach: function(worker) {

        worker.port.on('sendRequest', function (data) {
            customRequest.send(data.request)
                .then(function (response) {
                    worker.port.emit('sendRequestSuccess', {
                        id: data.id,
                        response: response
                    });
                })
                .catch(function (error) {
                    worker.port.emit('sendRequestError', {
                        id: data.id,
                        error: error
                    });
                });
        });

        worker.port.on('sendBrowserRequest', function (data) {
            customBrowserRequest.send(data.request)
                .then(function (response) {
                    worker.port.emit('sendBrowserRequestSuccess', {
                        id: data.id,
                        response: response
                    });
                })
                .catch(function (error) {
                    worker.port.emit('sendBrowserRequestError', {
                        id: data.id,
                        error: error
                    });
                });
        });

    }
});
