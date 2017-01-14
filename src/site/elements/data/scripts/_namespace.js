(function () {
    'use strict';

    const availableMixins = {
        eventListeners(element) {
            const eventListeners = {};

            element.addEventListener = function (eventName, listener) {
                if (!eventListeners[eventName]) {
                    eventListeners[eventName] = [];
                }

                eventListeners[eventName].push(listener);
            };

            element.removeEventListener = function (eventName, listener) {
                if (eventListeners[eventName]) {
                    const index = eventListeners[eventName].indexOf(listener);
                    if (index !== -1) {
                        eventListeners[eventName].splice(index, 1);
                    }
                }
            };

            element.fireEvent = function (eventName, data) {
                const listeners = eventListeners[eventName] || [];
                listeners.forEach(l => l(data));
            };
        }
    };

    window.RESTer = {
        register(path, mixins = []) {
            const element = path.split('.').reduce((obj, partOfPath) => {
                if (!obj.hasOwnProperty(partOfPath)) {
                    obj[partOfPath] = {};
                }

                return obj[partOfPath];
            }, this);

            for (let mixin of mixins) {
                availableMixins[mixin](element);
            }

            return element;
        }
    };
})();
