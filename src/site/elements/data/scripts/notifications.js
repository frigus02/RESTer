import createEventTarget from './_create-event-target.js';

export const e = createEventTarget();

export const notifications = [];

export function show(notification) {
    if (!notifications.some(n => n.id === notification.id)) {
        notifications.push(notification);

        e.fireEvent('notificationAdded', notification);
    }
}

export function hide(notification) {
    const index = notifications.findIndex(n => n.id === notification.id);
    if (index > -1) {
        notifications.splice(index, 1);

        e.fireEvent('notificationRemoved', notification);
    }
}
