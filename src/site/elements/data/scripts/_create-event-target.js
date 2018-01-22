export default function () {
    const eventListeners = {};
    const target = {};

    target.addEventListener = function (eventName, listener) {
        if (!eventListeners[eventName]) {
            eventListeners[eventName] = [];
        }

        eventListeners[eventName].push(listener);
    };

    target.removeEventListener = function (eventName, listener) {
        if (eventListeners[eventName]) {
            const index = eventListeners[eventName].indexOf(listener);
            if (index !== -1) {
                eventListeners[eventName].splice(index, 1);
            }
        }
    };

    target.fireEvent = function (eventName, data) {
        const listeners = eventListeners[eventName] || [];
        listeners.forEach(l => l(data));
    };

    return target;
}
