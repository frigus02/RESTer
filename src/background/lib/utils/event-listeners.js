(function () {
    'use strict';

    window.rester = window.rester || {};
    rester.utils = rester.utils || {};
    rester.utils.eventListeners = {};


    rester.utils.eventListeners.create = function () {
        const listeners = [];

        return {
            addListener(listener) {
                listeners.push(listener);
            },
            removeListener(listener) {
                const index = listeners.indexOf(listener);
                if (index >= 0) {
                    listeners.splice(index, 1);
                }
            },
            emit(message) {
                listeners.forEach(l => l(message));
            }
        };
    };
})();
