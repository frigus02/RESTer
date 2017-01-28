(function () {
    'use strict';

    window.rester = window.rester || {};
    rester.data = {};


    rester.data.onChange = rester.utils.eventListeners.create();
    rester.data.onSlowPerformance = rester.utils.eventListeners.create();
})();
