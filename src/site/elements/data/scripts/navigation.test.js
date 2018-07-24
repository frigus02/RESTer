/* eslint-env node, jest */

import Navigation from './navigation.js';
import * as mockRester from './rester.js';
import * as mockVariables from './variables.js';

jest.mock('./rester.js');
jest.mock('./variables.js');

const requestFields = ['id', 'collection', 'title'];
const historyFields = ['id', 'time', 'request.id', 'request.collection', 'request.title', 'request.method', 'request.url', 'request.variables', 'response.status'];
const environmentFields = ['id', 'name'];

const fakeRequests = [
    { id: 1, collection: 'JSONPlaceholder', title: 'Get Posts', method: 'GET', url: 'http://jsonplaceholder.com/posts', variables: {} },
    { id: 5, collection: 'JSONPlaceholder', title: 'Create Post', method: 'POST', url: 'http://jsonplaceholder.com/posts', variables: {} },
    { id: 6, collection: 'Google', title: 'Get Profile', method: 'GET', url: 'https://api.googleapis.com/profile', variables: {} },
    { id: 7, collection: 'JSONPlaceholder', title: 'Get Post', method: 'GET', url: 'http://jsonplaceholder.com/posts/{id}', variables: { values: { id: '123' } } }
];
const fakeRequest3Compiled = { id: 7, collection: 'JSONPlaceholder', title: 'Get Post', method: 'GET', url: 'http://jsonplaceholder.com/posts/123', variables: { values: { id: '123' } } };
const fakeHistoryEntries = [
    { id: 46, time: new Date('February 21, 2016 12:50'), request: { method: 'GET', url: 'http://google.com', variables: {} }, response: { status: 200 } },
    { id: 45, time: new Date('February 21, 2016 12:43'), request: fakeRequests[0], response: { status: 200 } },
    { id: 44, time: new Date('February 21, 2016 12:40'), request: fakeRequests[1], response: { status: 200 } },
    { id: 43, time: new Date('February 21, 2016 12:39'), request: fakeRequests[0], response: { status: 200 } },
    { id: 42, time: new Date('February 18, 2016 15:03'), request: fakeRequests[2], response: { status: 200 } },
    { id: 41, time: new Date('February 18, 2016 15:01'), request: fakeRequests[3], response: { status: 200 } }
];
const fakeEnvironments = [
    { id: 1, name: 'dev', values: {} },
    { id: 3, name: 'prod', values: {} }
];

class Deferred {
    constructor() {
        this.promise = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }

    static mock(fn) {
        const deferred = new Deferred();
        fn.mockReturnValue(deferred.promise);
        return deferred;
    }

    static flush() {
        return new Promise(resolve => setImmediate(resolve));
    }
}

let getRequestsDfd;
let getHistoryEntriesDfd;
let getEnvironmentDfd;
let settingsLoadedDfd;
let nav;

beforeEach(function () {
    getRequestsDfd = Deferred.mock(mockRester.getRequests);
    getHistoryEntriesDfd = Deferred.mock(mockRester.getHistoryEntries);
    getEnvironmentDfd = Deferred.mock(mockRester.getEnvironment);
    mockRester.mockSettings({
        activeEnvironment: 1
    });
    settingsLoadedDfd = new Deferred();
    mockRester.mockSettingsLoaded(settingsLoadedDfd.promise);
    mockVariables.replaceWithoutProvidedValues.mockImplementation(obj => obj === fakeRequests[3] ? fakeRequest3Compiled : obj);

    nav = new Navigation();
});

afterEach(function () {
    nav.destroy();
    jest.resetAllMocks();
});

test('items are created on startup', async function () {
    expect(nav.items).toEqual([]);
    expect(mockRester.getRequests).toBeCalledWith(requestFields);
    expect(mockRester.getHistoryEntries).toBeCalledWith(200, historyFields);

    settingsLoadedDfd.resolve();
    await Deferred.flush();

    expect(mockRester.getEnvironment).toBeCalledWith(mockRester.settings.activeEnvironment, environmentFields);

    getRequestsDfd.resolve(fakeRequests);
    getHistoryEntriesDfd.resolve(fakeHistoryEntries.slice(1));
    getEnvironmentDfd.resolve(fakeEnvironments[0]);
    await Deferred.flush();

    expect(mockVariables.replaceWithoutProvidedValues).toBeCalledWith(fakeRequests[3], fakeRequests[3].variables.values);
    expect(nav.items).toMatchSnapshot();
});

describe('with resolved data', function () {
    beforeEach(async function () {
        settingsLoadedDfd.resolve();
        getRequestsDfd.resolve(fakeRequests);
        getHistoryEntriesDfd.resolve(fakeHistoryEntries.slice(1));
        getEnvironmentDfd.resolve(fakeEnvironments[0]);

        await Deferred.flush();
    });

    test('getNextRequestId returns id from next item', function () {
        expect(nav.getNextRequestId(5)).toBe(7);
    });

    test('getNextRequestId returns id from previous item when no next item is available', function () {
        expect(nav.getNextRequestId(1)).toBe(7);
    });

    test('getNextRequestId returns id from first item in next collection when current collection has only one item', function () {
        expect(nav.getNextRequestId(6)).toBe(5);
    });

    test('getNextRequestId returns undefined when only one item exists', async function () {
        const changeListener = mockRester.e.addEventListener.mock.calls[0][1];

        // Delete all items except one.
        changeListener(new CustomEvent('dataChange', {
            detail: [
                { action: 'delete', item: { id: fakeRequests[0].id }, itemType: 'Request' },
                { action: 'delete', item: { id: fakeRequests[1].id }, itemType: 'Request' },
                { action: 'delete', item: { id: fakeRequests[2].id }, itemType: 'Request' }
            ]
        }));

        expect(nav.getNextRequestId(fakeRequests[3].id)).toBeUndefined();
    });
});

describe('with resolved empty data', function () {
    beforeEach(async function () {
        settingsLoadedDfd.resolve();
        getRequestsDfd.resolve([]);
        getHistoryEntriesDfd.resolve([]);
        getEnvironmentDfd.resolve(fakeEnvironments[0]);

        await Deferred.flush();
    });

    test('items are updated when data changes', function () {
        expect(mockRester.e.addEventListener).toBeCalledWith('dataChange', expect.any(Function));

        const changeListener = mockRester.e.addEventListener.mock.calls[0][1];

        // Check preconditions.
        expect(nav.items).toMatchSnapshot();

        // Add some requests and history entries.
        changeListener(new CustomEvent('dataChange', {
            detail: [
                { action: 'add', item: fakeRequests[0], itemType: 'Request' },
                { action: 'add', item: fakeRequests[1], itemType: 'Request' },
                { action: 'add', item: fakeRequests[2], itemType: 'Request' },
                { action: 'add', item: fakeHistoryEntries[5], itemType: 'HistoryEntry' },
                { action: 'add', item: fakeHistoryEntries[4], itemType: 'HistoryEntry' }
            ]
        }));

        expect(nav.items).toMatchSnapshot('1. Added 3 requests and 2 history entries');

        // Delete a request. Now the collection is empty and we should have one item less.
        changeListener(new CustomEvent('dataChange', {
            detail: [
                { action: 'delete', item: { id: fakeRequests[2].id }, itemType: 'Request' }
            ]
        }));

        expect(nav.items).toMatchSnapshot('2. Deleted last request in collection');

        // Change a request and add more history entries.
        changeListener(new CustomEvent('dataChange', {
            detail: [
                { action: 'put', item: fakeRequests[1], itemType: 'Request' },
                { action: 'add', item: fakeHistoryEntries[3], itemType: 'HistoryEntry' },
                { action: 'add', item: fakeHistoryEntries[2], itemType: 'HistoryEntry' },
                { action: 'add', item: fakeHistoryEntries[1], itemType: 'HistoryEntry' }
            ]
        }));

        expect(nav.items).toMatchSnapshot('3. Updated 1 request and added 3 history entries');

        // Add a 6th history entry. This should remove the oldest history entry from the
        // list because we only want to show 5 items max.
        changeListener(new CustomEvent('dataChange', {
            detail: [
                { action: 'add', item: fakeHistoryEntries[0], itemType: 'HistoryEntry' }
            ]
        }));

        expect(nav.items).toMatchSnapshot('4. Added 6th history entry');

        // Delete a request. This time the collection is not empty yet. So the overall count
        // should stay the same.
        changeListener(new CustomEvent('dataChange', {
            detail: [
                { action: 'delete', item: { id: fakeRequests[0].id }, itemType: 'Request' }
            ]
        }));

        expect(nav.items).toMatchSnapshot('5. Deleted 1 request');

        // Should handle name changes of the active environment
        const changedEnvironment = Object.assign({}, fakeEnvironments[0], {
            name: 'prod'
        });
        changeListener(new CustomEvent('dataChange', {
            detail: [
                { action: 'put', item: changedEnvironment, itemType: 'Environment' }
            ]
        }));

        expect(nav.items).toMatchSnapshot('6. Updated environment name');
    });

    test('items are updated when settings change', async function () {
        expect(mockRester.e.addEventListener).toBeCalledWith('settingsChange', expect.any(Function));

        const settingsChangeListener = mockRester.e.addEventListener.mock.calls[1][1];

        // Check preconditions.
        expect(nav.items.length).toEqual(7);
        // const envItem1 = nav.items.find(item => item.title === 'Environment');
        // expect(envItem1.subtitle).toBe('dev');

        // Should handle change of active environment
        mockRester.settings.activeEnvironment = null;
        settingsChangeListener();

        await Deferred.flush();

        const envItem2 = nav.items.find(item => item.title === 'Environment');
        expect(envItem2.subtitle).toBeUndefined();
    });
});
