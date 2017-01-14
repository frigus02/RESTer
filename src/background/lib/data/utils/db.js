(function () {
    'use strict';

    window.rester = window.rester || {};
    rester.data = rester.data || {};
    rester.data.utils = rester.data.utils || {};


    rester.data.utils.db = new rester.data.utils.DataStore([
        {
            name: 'authProviderConfigs'
        },
        {
            name: 'authTokens'
        },
        {
            name: 'environments'
        },
        {
            name: 'history'
        },
        {
            name: 'requests',
            indexes: ['collection']
        }
    ]);
})();
