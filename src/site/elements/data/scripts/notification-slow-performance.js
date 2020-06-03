import dialogs from './dialogs.js';
import { show, hide } from './notifications.js';
import { e as resterEvents } from './rester.js';

const notification = {
    id: 'slowPerformance',
    title: 'RESTer is running slow',
    description: '',
    open() {
        dialogs.historyCleanup.show().then((result) => {
            if (result.reason.confirmed) {
                hide(notification);
            }
        });
    },
};

resterEvents.addEventListener('dataSlowPerformance', (e) => {
    const seconds = (e.detail.duration / 1000).toFixed(1);
    notification.description = `The last operation took ${seconds}s to complete. Clean up some old history to speed it up.`;

    show(notification);
});
