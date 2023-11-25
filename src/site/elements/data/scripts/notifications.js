import CustomEventTarget from '../../../../shared/custom-event-target.js';

export const e = new CustomEventTarget();

export const notifications = [];

export function show(notification) {
    if (!notifications.some((n) => n.id === notification.id)) {
        notifications.push(notification);

        e.dispatchEvent(
            new CustomEvent('notificationAdded', {
                detail: notification,
            }),
        );
    }
}

export function hide(notification) {
    const index = notifications.findIndex((n) => n.id === notification.id);
    if (index > -1) {
        notifications.splice(index, 1);

        e.dispatchEvent(
            new CustomEvent('notificationRemoved', {
                detail: notification,
            }),
        );
    }
}
