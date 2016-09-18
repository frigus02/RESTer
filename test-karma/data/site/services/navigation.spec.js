'use strict';

describe('service: $navigation', function () {
    beforeEach(module('app'));

    const requestFields = ['id', 'collection', 'title'],
          historyFields = ['id', 'time', 'request.id', 'request.collection', 'request.title', 'request.method', 'request.url', 'request.variables'],
          environmentFields = ['id', 'name'];

    let $navigation;
    let $rootScope;
    let $q;
    let $filter;

    let dateFilter;
    let $rester;
    let $resterGetRequestsDeferred;
    let $resterGetHistoryEntriesDeferred;
    let $resterGetEnvironmentDeferred;
    let $resterSettingsLoadedDeferred;
    let $variables;

    let fakeRequests;
    let fakeHistoryEntries;
    let fakeEnvironments;

    beforeEach(function () {
        dateFilter = jasmine.createSpy().and.returnValue('<formatteddate>');
        $rester = {};
        $variables = { $$providers: [] };

        module({
            dateFilter: dateFilter,
            $rester: $rester,
            $variables: $variables,
            $variablesProviderEnv: undefined
        });
    });

    beforeEach(inject(function (_$q_, _$rootScope_, _$filter_) {
        $q = _$q_;
        $rootScope = _$rootScope_;
        $filter = _$filter_;
    }));

    beforeEach(function () {
        $resterGetRequestsDeferred = $q.defer();
        $resterGetHistoryEntriesDeferred = $q.defer();
        $resterGetEnvironmentDeferred = $q.defer();
        $resterSettingsLoadedDeferred = $q.defer();

        Object.assign($rester, {
            getRequests: jasmine.createSpy().and.returnValue($resterGetRequestsDeferred.promise),
            getHistoryEntries: jasmine.createSpy().and.returnValue($resterGetHistoryEntriesDeferred.promise),
            getEnvironment: jasmine.createSpy().and.returnValue($resterGetEnvironmentDeferred.promise),
            addEventListener: jasmine.createSpy(),
            settings: {
                activeEnvironment: 1
            },
            settingsLoaded: $resterSettingsLoadedDeferred.promise
        });

        Object.assign($variables, {
            replace: jasmine.createSpy().and.returnValue({})
        });

        fakeRequests = [
            {id: 1, collection: 'JSONPlaceholder', title: 'Get Posts', method: 'GET', url: 'http://jsonplaceholder.com/posts', variables: {enabled: false}},
            {id: 5, collection: 'JSONPlaceholder', title: 'Create Post',  method: 'POST', url: 'http://jsonplaceholder.com/posts', variables: {enabled: false}},
            {id: 6, collection: 'Google', title: 'Get Profile',  method: 'GET', url: 'https://api.googleapis.com/profile', variables: {enabled: false}},
            {id: 7, collection: 'JSONPlaceholder', title: 'Get Post', method: 'GET', url: 'http://jsonplaceholder.com/posts/{id}', variables: {enabled: true, values: {id: '123'}}}
        ];
        fakeHistoryEntries = [
            {id: 46, time: new Date('2016-02-21T12:50:00Z'), request: {method: 'GET', url: 'http://google.com', variables: {enabled: false}}},
            {id: 45, time: new Date('2016-02-21T12:43:00Z'), request: fakeRequests[0]},
            {id: 44, time: new Date('2016-02-21T12:40:00Z'), request: fakeRequests[1]},
            {id: 43, time: new Date('2016-02-21T12:39:00Z'), request: fakeRequests[0]},
            {id: 42, time: new Date('2016-02-18T15:03:00Z'), request: fakeRequests[2]},
            {id: 41, time: new Date('2016-02-18T15:01:00Z'), request: fakeRequests[3]}
        ];
        fakeEnvironments = [
            {id: 1, name: 'dev', values: {}},
            {id: 3, name: 'prod', values: {}}
        ];
    });

    beforeEach(inject(function (_$navigation_) {
        $navigation = _$navigation_;
    }));


    describe('items', function () {
        it('creates navigation items', function () {
            expect($navigation.items).toEqual([]);

            expect($rester.getRequests).toHaveBeenCalledTimes(1);
            expect($rester.getRequests).toHaveBeenCalledWith(requestFields);
            expect($rester.getHistoryEntries).toHaveBeenCalledTimes(1);
            expect($rester.getHistoryEntries).toHaveBeenCalledWith(-5, historyFields);

            $resterGetRequestsDeferred.resolve(fakeRequests);
            $resterGetHistoryEntriesDeferred.resolve(fakeHistoryEntries.slice(1, 6));
            $resterSettingsLoadedDeferred.resolve();
            $rootScope.$apply();

            expect($rester.getEnvironment).toHaveBeenCalledWith($rester.settings.activeEnvironment, environmentFields);

            $resterGetEnvironmentDeferred.resolve(fakeEnvironments[0]);
            $rootScope.$apply();

            expect($variables.replace).toHaveBeenCalledWith(fakeRequests[3], fakeRequests[3].variables.values);

            expect($navigation.items.length).toBe(13);
            expect($navigation.items[0]).toEqual(jasmine.objectContaining({id: 'requests', type: 'subheader'}));
            expect($navigation.items[1]).toEqual(jasmine.objectContaining({id: 'requestcollection:Google', type: 'group'}));
            expect($navigation.items[2]).toEqual(jasmine.objectContaining({id: 'requestcollection:JSONPlaceholder', type: 'group'}));
            expect($navigation.items[3]).toEqual(jasmine.objectContaining({id: 'divider:settings', type: 'divider'}));
            expect($navigation.items[4]).toEqual(jasmine.objectContaining({id: 'settings', type: 'subheader'}));
            expect($navigation.items[5]).toEqual(jasmine.objectContaining({id: 'environments', type: 'item', subtitle: fakeEnvironments[0].name}));
            expect($navigation.items[6]).toEqual(jasmine.objectContaining({id: 'divider:history', type: 'divider'}));
            expect($navigation.items[7]).toEqual(jasmine.objectContaining({id: 'history', type: 'subheader'}));
            expect($navigation.items[8]).toEqual(jasmine.objectContaining({id: 'historyentry:45', type: 'item', title: '<formatteddate> JSONPlaceholder / Get Posts', subtitle: 'GET http://jsonplaceholder.com/posts'}));
            expect($navigation.items[12]).toEqual(jasmine.objectContaining({id: 'historyentry:41', type: 'item', title: '<formatteddate> JSONPlaceholder / Get Post', subtitle: 'undefined undefined'}));
        });

        it('updates navigation items on data change', function () {
            // Create initial navigation items.
            $resterGetRequestsDeferred.resolve([]);
            $resterGetHistoryEntriesDeferred.resolve([]);
            $resterGetEnvironmentDeferred.resolve(fakeEnvironments[0]);
            $resterSettingsLoadedDeferred.resolve();
            $rootScope.$apply();

            // Check preconditions.
            expect($navigation.items.length).toEqual(6);
            expect($rester.addEventListener).toHaveBeenCalledWith('dataChange', jasmine.any(Function));

            let changeListener = $rester.addEventListener.calls.argsFor(0)[1],
                envItem = $navigation.items.find(item => item.id === 'environments');

            // Add some requests and history entries.
            changeListener([
                {action: 'add', item: fakeRequests[0], itemType: 'Request'},
                {action: 'add', item: fakeRequests[1], itemType: 'Request'},
                {action: 'add', item: fakeRequests[2], itemType: 'Request'},
                {action: 'add', item: fakeHistoryEntries[5], itemType: 'HistoryEntry'},
                {action: 'add', item: fakeHistoryEntries[4], itemType: 'HistoryEntry'}
            ]);

            expect($navigation.items.length).toEqual(10);

            // Delete a request. Now the collection is empty and we should have one item less.
            changeListener([
                {action: 'delete', item: fakeRequests[2], itemType: 'Request'}
            ]);

            expect($navigation.items.length).toEqual(9);

            // Change a request and add more history entries.
            changeListener([
                {action: 'put', item: fakeRequests[1], itemType: 'Request'},
                {action: 'add', item: fakeHistoryEntries[3], itemType: 'HistoryEntry'},
                {action: 'add', item: fakeHistoryEntries[2], itemType: 'HistoryEntry'},
                {action: 'add', item: fakeHistoryEntries[1], itemType: 'HistoryEntry'}
            ]);

            expect($navigation.items.length).toEqual(12);

            // Add a 6th history entry. This should remove the oldest history entry from the
            // list because we only want to show 5 items max.
            changeListener([
                {action: 'add', item: fakeHistoryEntries[0], itemType: 'HistoryEntry'}
            ]);

            expect($navigation.items.length).toEqual(12);

            // Delete a request. This time the collection is not empty yet. So the overall count
            // should stay the same.
            changeListener([
                {action: 'delete', item: fakeRequests[0], itemType: 'Request'}
            ]);

            expect($navigation.items.length).toEqual(12);

            // Should handle name changes of the active environment
            fakeEnvironments[0].name = 'prod';
            changeListener([
                {action: 'put', item: fakeEnvironments[0], itemType: 'Environment'}
            ]);

            expect(envItem.subtitle).toBe(fakeEnvironments[0].name);
        });

        it('updates navigation items on settings change', function () {
            // Create initial navigation items.
            $resterGetRequestsDeferred.resolve([]);
            $resterGetHistoryEntriesDeferred.resolve([]);
            $resterGetEnvironmentDeferred.resolve(fakeEnvironments[0]);
            $resterSettingsLoadedDeferred.resolve();
            $rootScope.$apply();

            // Check preconditions.
            expect($navigation.items.length).toEqual(6);
            expect($rester.addEventListener).toHaveBeenCalledWith('settingsChange', jasmine.any(Function));

            let settingsChangeListener = $rester.addEventListener.calls.argsFor(1)[1],
                envItem = $navigation.items.find(item => item.id === 'environments');

            // Should handle change of active environment
            $rester.settings.activeEnvironment = null;
            settingsChangeListener();
            $rootScope.$apply();

            expect(envItem.subtitle).not.toBeDefined();
        });
    });

    describe('getNextRequestId', function () {
        beforeEach(function () {
            $resterGetRequestsDeferred.resolve(fakeRequests);
            $resterGetHistoryEntriesDeferred.resolve(fakeHistoryEntries.slice(1, 6));
            $resterSettingsLoadedDeferred.resolve();
            $resterGetEnvironmentDeferred.resolve(fakeEnvironments[0]);
            $rootScope.$apply();
        });

        it('should return id from next item', function () {
            expect($navigation.getNextRequestId(5)).toBe(7);
        });

        it('should return id from previous item when no next item is available', function () {
            expect($navigation.getNextRequestId(1)).toBe(7);
        });

        it('should return id from first item in next collection when current collection has only one item', function () {
            expect($navigation.getNextRequestId(6)).toBe(5);
        });

        it('should return undefined when only one item exists', function () {
            // Delete all items except one.
            let changeListener = $rester.addEventListener.calls.argsFor(0)[1];
            changeListener([
                {action: 'delete', item: fakeRequests[0], itemType: 'Request'},
                {action: 'delete', item: fakeRequests[1], itemType: 'Request'},
                {action: 'delete', item: fakeRequests[2], itemType: 'Request'}
            ]);

            expect($navigation.getNextRequestId(7)).toBeUndefined();
        });
    });
});
