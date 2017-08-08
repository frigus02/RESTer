(function () {
    'use strict';

    const notification = {
        id: 'slowPerformance',
        title: 'RESTer is running slow',
        description: '',
        open() {
            RESTer.dialogs.notificationSlowPerformance.show().then(result => {
                if (result.reason.confirmed) {
                    RESTer.notifications.hide(notification);
                }
            });
        }
    };

    RESTer.rester.addEventListener('dataSlowPerformance', details => {
        const seconds = (details.duration / 1000).toFixed(1);
        notification.description = `The last operation took ${seconds}s to complete. Clean up some old history to speed it up.`;

        RESTer.notifications.show(notification);
    });
})();
