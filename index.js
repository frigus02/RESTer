const self = require('sdk/self');
const buttons = require('sdk/ui/button/action');
const tabs = require('sdk/tabs');
const { load } = require('lib/request');


var button = buttons.ActionButton({
    id: 'mozilla-link',
    label: 'Visit Mozilla',
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

                worker.port.on('load', function (data) {
                    load(data.request)
                        .then(function (response) {
                            worker.port.emit('loadsuccess', {
                                id: data.id,
                                response: response
                            });
                        })
                        .catch(function (error) {
                            worker.port.emit('loaderror', {
                                id: data.id,
                                error: error
                            });
                        });
                });
            }
        });
    }
});
