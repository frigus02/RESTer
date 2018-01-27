import CustomEventTarget from './custom-event-target.js';
import dialogs from './dialogs.js';
import { time as formatTime } from './format.js';
import {
    Divider,
    Group,
    Item,
    Subheader
} from './navigation-item-types.js';
import {
    e as resterEvents,
    getEnvironment,
    getHistoryEntries,
    getRequests,
    settings,
    settingsLoaded
} from './rester.js';
import { clone, group, sort, sortedIndexOf } from './util.js';
import { replaceWithoutProvidedValues } from './variables.js';

const requestFields = ['id', 'collection', 'title'];
const historyFields = ['id', 'time', 'request.id', 'request.collection', 'request.title', 'request.method', 'request.url', 'request.variables'];
const environmentFields = ['id', 'name'];

function createListOfRequestNavItems(rawRequests) {
    const collGroups = group(rawRequests, request => request.collection[0]);
    const collGroupArray = Object.keys(collGroups).map(name => ({
        name,
        items: collGroups[name]
    }));
    const sortedCollGroupArray = sort(collGroupArray, 'name');

    return sortedCollGroupArray.map(coll => {
        const collection = coll.name;
        const requests = coll.items.map(request => {
            request = clone(request);
            request.collection = request.collection.slice(1);
            return request;
        });

        const collItem = createRequestCollectionNavItem(collection);
        const subrequests = requests
            .filter(request => request.collection.length === 0)
            .map(request => createRequestNavItem(request));
        const subcollections = createListOfRequestNavItems(
            requests.filter(request => request.collection.length > 0));
        collItem.items = sort(subcollections.concat(subrequests), 'title');

        return collItem;
    });
}

function createRequestCollectionNavItem(collection) {
    return new Group({
        title: collection
    });
}

function createRequestNavItem(request) {
    return new Item({
        title: request.title,
        action: {
            url: `#/request/${request.id}`
        },
        data: {
            id: request.id
        }
    });
}

function createHistoryNavItem(historyEntry) {
    let requestTitle = '';
    if (historyEntry.request.id) {
        requestTitle = `${historyEntry.request.collection} / ${historyEntry.request.title}`;
    }

    const compiledRequest = replaceWithoutProvidedValues(historyEntry.request, historyEntry.request.variables.values);

    return new Item({
        title: `${formatTime(historyEntry.time)} ${requestTitle}`,
        subtitle: `${compiledRequest.method} ${compiledRequest.url}`,
        action: {
            url: `#/request/${historyEntry.request.id || ''}/history/${historyEntry.id}`
        }
    });
}

function createEnvironmentNavItem(activeEnvironment) {
    return new Item({
        title: 'Environment',
        subtitle: activeEnvironment && activeEnvironment.name,
        action: {
            url: '#/environments'
        },
        secondaryAction: {
            icon: 'more-vert',
            handler() {
                dialogs.environmentSelect.show();
            }
        }
    });
}

async function getActiveEnvironment() {
    const envId = settings.activeEnvironment;
    if (envId) {
        return await getEnvironment(envId, environmentFields);
    }
}

function findNextRequestId(requestId, requestItems) {
    function findNextId(i) {
        let nextItem;
        if (i < requestItems.length - 1) {
            nextItem = requestItems[i + 1];
        } else if (i > 0) {
            nextItem = requestItems[i - 1];
        } else {
            return 'noNextInGroup';
        }

        while (nextItem.isGroup) {
            nextItem = nextItem.items[0];
        }

        return nextItem.data.id;
    }

    for (let i = 0; i < requestItems.length; i++) {
        const item = requestItems[i];
        if (item.isGroup) {
            const result = findNextRequestId(requestId, item.items);
            if (result === 'noNextInGroup') {
                return findNextId(i);
            } else if (typeof result !== 'undefined') {
                return result;
            }
        } else if (item.data.id === requestId) {
            return findNextId(i);
        }
    }
}

export default class Navigation extends CustomEventTarget {
    constructor() {
        super();
        this.items = [];
        this.itemsCreated = false;

        this._requestNavItemsOffset = 0;
        this._requestNavItemsCount = 0;
        this._environmentNavItemIndex = 0;
        this._historyNavItemsOffset = 0;
        this._historyNavItemsCount = 0;
        this._updateNavigationBasedOnDataChanges = this._updateNavigationBasedOnDataChanges.bind(this);
        this._updateNavigationBasedOnSettingsChanges = this._updateNavigationBasedOnSettingsChanges.bind(this);

        this._create();
        resterEvents.addEventListener('dataChange', this._updateNavigationBasedOnDataChanges);
        resterEvents.addEventListener('settingsChange', this._updateNavigationBasedOnSettingsChanges);
    }

    async _create() {
        const [requests, historyEntries, activeEnvironment] = await Promise.all([
            getRequests(requestFields),
            getHistoryEntries(5, historyFields),
            settingsLoaded.then(() => getActiveEnvironment())
        ]);

        this.items.push(new Subheader({
            title: 'Requests',
            action: {
                icon: 'add',
                url: '#/'
            }
        }));

        this._requestNavItemsOffset = 1;
        const requestNavItems = createListOfRequestNavItems(requests.map(r => {
            r = clone(r);
            r.collection = r.collection.split(/\s*\/\s*/i);
            return r;
        }));
        this._requestNavItemsCount = requestNavItems.length;

        this.items.push(
            ...requestNavItems,
            new Divider(),
            new Subheader({
                title: 'Settings',
                action: {
                    icon: 'settings',
                    url: '#/settings'
                }
            })
        );

        this._environmentNavItemIndex = this._requestNavItemsOffset + this._requestNavItemsCount + 2;

        this.items.push(
            createEnvironmentNavItem(activeEnvironment),
            new Divider(),
            new Subheader({
                title: 'History',
                action: {
                    icon: 'history',
                    url: '#/history'
                }
            })
        );

        this._historyNavItemsOffset = this._environmentNavItemIndex + 3;
        const historyNavItems = historyEntries.map(entry => createHistoryNavItem(entry));
        this._historyNavItemsCount = historyNavItems.length;

        this.items.push(...historyNavItems);

        this.itemsCreated = true;
        this.dispatchEvent(new CustomEvent('itemsCreated'));
    }

    _get(path) {
        return path.reduce((prev, current) => prev[current], this.items);
    }

    _splice(path, start, deleteCount, ...items) {
        this._get(path).splice(start, deleteCount, ...items);

        this.dispatchEvent(new CustomEvent('itemsChanged', {
            detail: {
                path,
                start,
                deleteCount,
                items
            }
        }));
    }

    _removeRequestNavigationItem(requestId, path = [], offset = this._requestNavItemsOffset, count = this._requestNavItemsCount) {
        const requests = this._get(path);
        for (let requestIndex = offset; requestIndex < offset + count; requestIndex++) {
            const request = requests[requestIndex];
            if (request.isItem && request.data.id === requestId) {
                this._splice(path, requestIndex, 1);
                return true;
            }

            if (request.isGroup && this._removeRequestNavigationItem(requestId, [...path, requestIndex, 'items'], 0, request.items.length)) {
                if (request.items.length === 0) {
                    this._splice(path, requestIndex, 1);

                    if (path.length === 0) {
                        this._requestNavItemsCount--;
                        this._environmentNavItemIndex = this._requestNavItemsOffset + this._requestNavItemsCount + 2;
                        this._historyNavItemsOffset = this._environmentNavItemIndex + 3;
                    }
                }

                return true;
            }
        }

        return false;
    }

    _updateNavigationBasedOnDataChanges(e) {
        for (const change of e.detail) {
            if (change.itemType === 'Request') {
                if (change.action === 'put' || change.action === 'delete') {
                    this._removeRequestNavigationItem(change.item.id);
                }

                if (change.action === 'add' || change.action === 'put') {
                    let collectionParts = change.item.collection.split(/\s*\/\s*/i),
                        collectionPath = [],
                        collectionOffset = this._requestNavItemsOffset,
                        collectionCount = this._requestNavItemsCount;

                    while (collectionParts.length > 0) {
                        const collectionItems = this._get(collectionPath).slice(collectionOffset, collectionOffset + collectionCount);
                        let collectionIndex = collectionItems.findIndex(item => item.title === collectionParts[0]);
                        if (collectionIndex === -1) {
                            const collection = createRequestCollectionNavItem(collectionParts[0]);

                            collectionIndex = sortedIndexOf(collectionItems, {title: collectionParts[0]}, 'title');
                            this._splice(collectionPath, collectionOffset + collectionIndex, 0, collection);
                            if (collectionPath.length === 0) {
                                this._requestNavItemsCount++;
                            }
                        }

                        collectionParts.splice(0, 1);
                        collectionPath.push(collectionOffset + collectionIndex, 'items');
                        collectionOffset = 0;
                        collectionCount = this._get(collectionPath).length;
                    }

                    const collectionItems = this._get(collectionPath);
                    const insertAtIndex = sortedIndexOf(collectionItems, change.item, 'title');
                    this._splice(collectionPath, insertAtIndex, 0, createRequestNavItem(change.item));
                }

                this._environmentNavItemIndex = this._requestNavItemsOffset + this._requestNavItemsCount + 2;
                this._historyNavItemsOffset = this._environmentNavItemIndex + 3;
            } else if (change.itemType === 'HistoryEntry') {
                if (change.action === 'add') {
                    const newHistoryItem = createHistoryNavItem(change.item);

                    this._splice([], this._historyNavItemsOffset, 0, newHistoryItem);
                    this._historyNavItemsCount++;
                    if (this._historyNavItemsCount > 5) {
                        this._splice([], this._historyNavItemsOffset + 5, 1);
                        this._historyNavItemsCount--;
                    }
                }
            } else if (change.itemType === 'Environment') {
                if (change.item.id === settings.activeEnvironment) {
                    this._splice([], this._environmentNavItemIndex, 1, createEnvironmentNavItem(change.item));
                }
            }
        }
    }

    async _updateNavigationBasedOnSettingsChanges() {
        const env = await getActiveEnvironment();
        this._splice([], this._environmentNavItemIndex, 1, createEnvironmentNavItem(env));
    }

    getNextRequestId(requestId) {
        const requests = this.items.slice(this._requestNavItemsOffset, this._requestNavItemsOffset + this._requestNavItemsCount);
        const result = findNextRequestId(requestId, requests);
        if (result !== 'noNextInGroup') {
            return result;
        }
    }

    destroy() {
        resterEvents.removeEventListener('dataChange', this._updateNavigationBasedOnDataChanges);
        resterEvents.removeEventListener('settingsChange', this._updateNavigationBasedOnSettingsChanges);
    }
}

let single;
export function getSingle() {
    if (!single) {
        single = new Navigation();
    }

    return single;
}
