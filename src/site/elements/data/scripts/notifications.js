(function () {
    'use strict';

    const self = RESTer.register('notifications', ['eventListeners']);

    self.notifications = [];

    self.show = function (notification) {
        if (!self.notifications.some(n => n.id === notification.id)) {
            self.notifications.push(notification);

            self.fireEvent('notificationAdded', notification);
        }
    };

    self.hide = function (notification) {
        const index = self.notifications.findIndex(n => n.id === notification.id);
        if (index > -1) {
            self.notifications.splice(index, 1);

            self.fireEvent('notificationRemoved', notification);
        }
    };
})();
