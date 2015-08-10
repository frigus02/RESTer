var RESTer = {
    actions: {
        load: 'rester.load',
        loadSuccess: 'rester.loadsuccess',
        loadError: 'rester.loaderror'
    },
    origin: 'resource://rester'
};
unsafeWindow.RESTer = cloneInto(RESTer, unsafeWindow);


window.addEventListener('message', function(event) {
    if (event.origin !== RESTer.origin) return;

    if (event.data.action === RESTer.actions.load) {
        self.port.emit('load', {
            id: event.data.id,
            request: event.data.request
        });
    }
});

self.port.on('loadsuccess', function (data) {
    window.postMessage({
        action: RESTer.actions.loadSuccess,
        id: data.id,
        response: data.response
    }, RESTer.origin);
});

self.port.on('loaderror', function (data) {
    window.postMessage({
        action: RESTer.actions.loadError,
        id: data.id,
        error: data.error
    }, RESTer.origin);
});
