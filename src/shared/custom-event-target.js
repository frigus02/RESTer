export default class CustomEventTarget {
    constructor() {
        this._listeners = {};
    }

    addEventListener(type, listener) {
        if (!this._listeners[type]) {
            this._listeners[type] = [];
        }

        this._listeners[type].push(listener);
    }

    removeEventListener(type, listener) {
        if (this._listeners[type]) {
            const index = this._listeners[type].indexOf(listener);
            if (index !== -1) {
                this._listeners[type].splice(index, 1);
            }
        }
    }

    dispatchEvent(event) {
        const listeners = this._listeners[event.type] || [];
        listeners.forEach(l => l(event));
    }
}
