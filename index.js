const self = require('sdk/self');
const buttons = require('sdk/ui/button/action');
const tabs = require('sdk/tabs');
const customrequest = require('lib/request');


buttons.ActionButton({
    id: 'rester',
    label: 'RESTer',
    icon: {
        '16': './site/images/icon16.png',
        '32': './site/images/icon32.png',
        '64': './site/images/icon64.png'
    },
    onClick: function (state) {
        tabs.open({
            url: './site/index.html',
            onReady: function(tab) {
                var worker = tab.attach({
                    contentScriptFile: './site-content/rester.js'
                });

                worker.port.on('sendRequest', function (data) {
                    customrequest.send(data.request)
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
            }
        });
    }
});
