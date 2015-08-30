window.addEventListener('message', function(event) {
    if (event.origin !== window.location.origin) return;

    if (event.data.action === 'rester.sendRequest') {
        self.port.emit('sendRequest', {
            id: event.data.id,
            request: event.data.request
        });
    } else if (event.data.action === 'rester.sendBrowserRequest') {
        self.port.emit('sendBrowserRequest', {
            id: event.data.id,
            request: event.data.request
        });
    }
});

self.port.on('sendRequestSuccess', function (data) {
    window.postMessage({
        action: 'rester.sendRequestSuccess',
        id: data.id,
        response: data.response
    }, window.location.origin);
});

self.port.on('sendRequestError', function (data) {
    window.postMessage({
        action: 'rester.sendRequestError',
        id: data.id,
        error: data.error
    }, window.location.origin);
});

self.port.on('sendBrowserRequestSuccess', function (data) {
    window.postMessage({
        action: 'rester.sendBrowserRequestSuccess',
        id: data.id,
        response: data.response
    }, window.location.origin);
});

self.port.on('sendBrowserRequestError', function (data) {
    window.postMessage({
        action: 'rester.sendBrowserRequestError',
        id: data.id,
        error: data.error
    }, window.location.origin);
});