var RESTer = {
    actions: {
        sendRequest: 'rester.sendRequest',
        sendRequestSuccess: 'rester.sendRequestSuccess',
        sendRequestError: 'rester.sendRequestError'
    },
    origin: 'resource://rester'
};
unsafeWindow.RESTer = cloneInto(RESTer, unsafeWindow);


window.addEventListener('message', function(event) {
    if (event.origin !== RESTer.origin) return;

    if (event.data.action === RESTer.actions.sendRequest) {
        self.port.emit('sendRequest', {
            id: event.data.id,
            request: event.data.request
        });
    }
});

self.port.on('sendRequestSuccess', function (data) {
    window.postMessage({
        action: RESTer.actions.sendRequestSuccess,
        id: data.id,
        response: data.response
    }, RESTer.origin);
});

self.port.on('sendRequestError', function (data) {
    window.postMessage({
        action: RESTer.actions.sendRequestError,
        id: data.id,
        error: data.error
    }, RESTer.origin);
});
