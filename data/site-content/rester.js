'use strict';

window.addEventListener('message', function (event) {
    if (event.origin !== window.location.origin) return;

    if (event.data.type === 'rester.api.request') {
        self.port.emit('api.request', {
            id: event.data.id,
            action: event.data.action,
            args: event.data.args
        });
    }
});

self.port.on('api.response', function (data) {
    window.postMessage({
        type: 'rester.api.response',
        id: data.id,
        result: data.result,
        error: data.error
    }, window.location.origin);
});
