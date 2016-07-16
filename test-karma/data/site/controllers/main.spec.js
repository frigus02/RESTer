'use strict';

describe('controller: MainCtrl', function () {
    beforeEach(module('app'));

    let $controller;
    let $rootScope;
    let $q;
    let $filter;

    let $scope;
    let $mdSidenav;
    let $state;
    let $data;
    let $settings;
    let $hotkeys;
    let $mdDialog;
    let $variables;

    let dateFilter;
    let $mdSidenavInstance;
    let $dataGetRequestsDeferred;
    let $dataGetHistoryEntriesDeferred;
    let $dataGetEnvironmentDeferred;

    let fakeRequests;
    let fakeHistoryEntries;
    let fakeEnvironments;

    beforeEach(function () {
        dateFilter = jasmine.createSpy().and.returnValue('<formatteddate>');
        module({
            dateFilter: dateFilter
        });
    });

    beforeEach(inject(function (_$controller_, _$q_, _$rootScope_, _$filter_) {
        $controller = _$controller_;
        $q = _$q_;
        $rootScope = _$rootScope_;
        $filter = _$filter_;
    }));

    beforeEach(function () {
        $scope = {
            $watch: jasmine.createSpy()
        };
        $mdSidenavInstance = jasmine.createSpyObj('$mdSidenavInstance', ['toggle']);
        $mdSidenav = jasmine.createSpy().and.returnValue($mdSidenavInstance);
        $state = {
            current: {},
            go: jasmine.createSpy()
        };
        $dataGetRequestsDeferred = $q.defer();
        $dataGetHistoryEntriesDeferred = $q.defer();
        $dataGetEnvironmentDeferred = $q.defer();
        $data = {
            Request: function () {},
            HistoryEntry: function () {},
            Environment: function () {},
            getRequests: jasmine.createSpy().and.returnValue($dataGetRequestsDeferred.promise),
            getHistoryEntries: jasmine.createSpy().and.returnValue($dataGetHistoryEntriesDeferred.promise),
            getEnvironment: jasmine.createSpy().and.returnValue($dataGetEnvironmentDeferred.promise),
            addChangeListener: jasmine.createSpy()
        };
        $settings = {
            addChangeListener: jasmine.createSpy(),
            activeEnvironment: 1
        };
        $hotkeys = {
            Hotkey: function (props) {
                Object.assign(this, props);
            },
            showCheatSheet: jasmine.createSpy(),
            add: jasmine.createSpy()
        };
        $mdDialog = jasmine.createSpyObj('$mdDialog', ['show']);
        $variables = {
            replace: jasmine.createSpy().and.returnValue({})
        };

        fakeRequests = [
            Object.assign(new $data.Request(), {id: 1, collection: 'JSONPlaceholder', title: 'Get Posts', method: 'GET', url: 'http://jsonplaceholder.com/posts', variables: {enabled: false}}),
            Object.assign(new $data.Request(), {id: 5, collection: 'JSONPlaceholder', title: 'Create Post',  method: 'POST', url: 'http://jsonplaceholder.com/posts', variables: {enabled: false}}),
            Object.assign(new $data.Request(), {id: 6, collection: 'Google', title: 'Get Profile',  method: 'GET', url: 'https://api.googleapis.com/profile', variables: {enabled: false}}),
            Object.assign(new $data.Request(), {id: 7, collection: 'JSONPlaceholder', title: 'Get Post', method: 'GET', url: 'http://jsonplaceholder.com/posts/{id}', variables: {enabled: true, values: {id: '123'}}})
        ];
        fakeHistoryEntries = [
            Object.assign(new $data.HistoryEntry(), {id: 46, time: new Date('2016-02-21T12:50:00Z'), request: Object.assign(new $data.Request(), {method: 'GET', url: 'http://google.com', variables: {enabled: false}})}),
            Object.assign(new $data.HistoryEntry(), {id: 45, time: new Date('2016-02-21T12:43:00Z'), request: fakeRequests[0]}),
            Object.assign(new $data.HistoryEntry(), {id: 44, time: new Date('2016-02-21T12:40:00Z'), request: fakeRequests[1]}),
            Object.assign(new $data.HistoryEntry(), {id: 43, time: new Date('2016-02-21T12:39:00Z'), request: fakeRequests[0]}),
            Object.assign(new $data.HistoryEntry(), {id: 42, time: new Date('2016-02-18T15:03:00Z'), request: fakeRequests[2]}),
            Object.assign(new $data.HistoryEntry(), {id: 41, time: new Date('2016-02-18T15:01:00Z'), request: fakeRequests[3]})
        ];
        fakeEnvironments = [
            Object.assign(new $data.Environment(), {id: 1, name: 'dev', values: {}})
        ];
    });


    beforeEach(function () {
        $controller('MainCtrl', { $scope: $scope, $rootScope: $rootScope, $mdSidenav: $mdSidenav, $state: $state, $data: $data, $settings: $settings, $q: $q, $filter: $filter, $hotkeys: $hotkeys, $mdDialog: $mdDialog, $variables: $variables });
    });


    it('initializes properties', function () {
        expect($scope.navItems).toEqual([]);

        expect($hotkeys.add).toHaveBeenCalledTimes(2);
        expect($hotkeys.add).toHaveBeenCalledWith(jasmine.any($hotkeys.Hotkey), $scope);
    });

    it('creates navigation items', function () {
        expect($data.getRequests).toHaveBeenCalledTimes(1);
        expect($data.getHistoryEntries).toHaveBeenCalledTimes(1);
        expect($data.getHistoryEntries).toHaveBeenCalledWith(-5);
        expect($data.getEnvironment).toHaveBeenCalledWith($settings.activeEnvironment);

        $dataGetRequestsDeferred.resolve(fakeRequests);
        $dataGetHistoryEntriesDeferred.resolve(fakeHistoryEntries.slice(1, 6));
        $dataGetEnvironmentDeferred.resolve(fakeEnvironments[0]);
        $rootScope.$apply();

        expect($variables.replace).toHaveBeenCalledWith(fakeRequests[3], fakeRequests[3].variables.values);

        expect($scope.navItems.length).toBe(13);
        expect($scope.navItems[0]).toEqual(jasmine.objectContaining({id: 'requests', type: 'subheader'}));
        expect($scope.navItems[1]).toEqual(jasmine.objectContaining({id: 'requestcollection:Google', type: 'group'}));
        expect($scope.navItems[2]).toEqual(jasmine.objectContaining({id: 'requestcollection:JSONPlaceholder', type: 'group'}));
        expect($scope.navItems[3]).toEqual(jasmine.objectContaining({id: 'divider:settings', type: 'divider'}));
        expect($scope.navItems[4]).toEqual(jasmine.objectContaining({id: 'settings', type: 'subheader'}));
        expect($scope.navItems[5]).toEqual(jasmine.objectContaining({id: 'environments', type: 'item', subtitle: fakeEnvironments[0].name}));
        expect($scope.navItems[6]).toEqual(jasmine.objectContaining({id: 'divider:history', type: 'divider'}));
        expect($scope.navItems[7]).toEqual(jasmine.objectContaining({id: 'history', type: 'subheader'}));
        expect($scope.navItems[8]).toEqual(jasmine.objectContaining({id: 'historyentry:45', type: 'item', title: '<formatteddate> JSONPlaceholder / Get Posts', subtitle: 'GET http://jsonplaceholder.com/posts'}));
        expect($scope.navItems[12]).toEqual(jasmine.objectContaining({id: 'historyentry:41', type: 'item', title: '<formatteddate> JSONPlaceholder / Get Post', subtitle: 'undefined undefined'}));
    });

    it('updates navigation items on data change', function () {
        // Create initial navigation items.
        $dataGetRequestsDeferred.resolve([]);
        $dataGetHistoryEntriesDeferred.resolve([]);
        $dataGetEnvironmentDeferred.resolve(fakeEnvironments[0]);
        $rootScope.$apply();

        // Check preconditions.
        expect($scope.navItems.length).toEqual(6);
        expect($data.addChangeListener).toHaveBeenCalledWith(jasmine.any(Function));

        let changeListener = $data.addChangeListener.calls.argsFor(0)[0],
            envItem = $scope.navItems.find(item => item.id === 'environments');

        // Add some requests and history entries.
        changeListener([
            {action: 'add', item: fakeRequests[0]},
            {action: 'add', item: fakeRequests[1]},
            {action: 'add', item: fakeRequests[2]},
            {action: 'add', item: fakeHistoryEntries[5]},
            {action: 'add', item: fakeHistoryEntries[4]}
        ]);

        expect($scope.navItems.length).toEqual(10);

        // Delete a request. Now the collection is empty and we should have one item less.
        changeListener([
            {action: 'delete', item: fakeRequests[2]}
        ]);

        expect($scope.navItems.length).toEqual(9);

        // Change a request and add more history entries.
        changeListener([
            {action: 'put', item: fakeRequests[1]},
            {action: 'add', item: fakeHistoryEntries[3]},
            {action: 'add', item: fakeHistoryEntries[2]},
            {action: 'add', item: fakeHistoryEntries[1]}
        ]);

        expect($scope.navItems.length).toEqual(12);

        // Add a 6th history entry. This should remove the oldest history entry from the
        // list because we only want to show 5 items max.
        changeListener([
            {action: 'add', item: fakeHistoryEntries[0]}
        ]);

        expect($scope.navItems.length).toEqual(12);

        // Delete a request. This time the collection is not empty yet. So the overall count
        // should stay the same.
        changeListener([
            {action: 'delete', item: fakeRequests[0]}
        ]);

        expect($scope.navItems.length).toEqual(12);

        // Should handle name changes of the active environment
        fakeEnvironments[0].name = 'prod';
        changeListener([
            {action: 'put', item: fakeEnvironments[0]}
        ]);

        expect(envItem.subtitle).toBe(fakeEnvironments[0].name);
    });

    it('updates navigation items on settings change', function () {
        // Create initial navigation items.
        $dataGetRequestsDeferred.resolve([]);
        $dataGetHistoryEntriesDeferred.resolve([]);
        $dataGetEnvironmentDeferred.resolve(fakeEnvironments[0]);
        $rootScope.$apply();

        // Check preconditions.
        expect($scope.navItems.length).toEqual(6);
        expect($settings.addChangeListener).toHaveBeenCalledWith(jasmine.any(Function));

        let settingsChangeListener = $settings.addChangeListener.calls.argsFor(0)[0],
            envItem = $scope.navItems.find(item => item.id === 'environments');

        // Should handle change of active environment
        $settings.activeEnvironment = null;
        settingsChangeListener();
        $rootScope.$apply();

        expect(envItem.subtitle).not.toBeDefined();
    });

    it('toggles the sidenav on toggleSidenav', function () {
        let menuId = 'test';
        $scope.toggleSidenav(menuId);

        expect($mdSidenav).toHaveBeenCalledWith(menuId);
        expect($mdSidenavInstance.toggle).toHaveBeenCalledTimes(1);
    });

    it('returns the title from the current state data on getTitle', function () {
        expect($scope.getTitle()).not.toBeDefined();

        let title = 'test';
        $state.current.data = {title: title};

        expect($scope.getTitle()).toBe(title);
    });

    it('returns the actions from the current state data on getActions', function () {
        expect($scope.getActions()).toEqual([]);

        let actions = ['test', 'blub'];
        $state.current.data = {actions: actions};

        expect($scope.getActions()).toBe(actions);
    });

    it('shows the shortcut cheat sheet on showShortcuts', function () {
        let $event = jasmine.createSpyObj('$event', ['preventDefault']);

        $scope.showShortcuts($event);

        expect($event.preventDefault).toHaveBeenCalledTimes(1);
        expect($hotkeys.showCheatSheet).toHaveBeenCalledWith($event);
    });

    it('updates the title on the $rootScope when it changes', function () {
        expect($scope.$watch).toHaveBeenCalledWith('getTitle()', jasmine.any(Function));
        expect($rootScope.title).not.toBeDefined();

        let watchListener = $scope.$watch.calls.argsFor(0)[1];
        let title = 'test';

        watchListener(title);
        expect($rootScope.title).toBe(title);
    });

    it('navigates to new request state on first hotkey callback', function () {
        let hotkey = $hotkeys.add.calls.argsFor(0)[0];

        expect(hotkey.combos).toEqual(['mod+m']);
        hotkey.callback();

        expect($state.go).toHaveBeenCalledWith('main.request.new');
    });

    it('shows quick open dialog on second hotkey callback', function () {
        let hotkey = $hotkeys.add.calls.argsFor(1)[0];

        expect(hotkey.combos).toEqual(['mod+o', 'mod+p']);
        hotkey.callback();

        expect($mdDialog.show).toHaveBeenCalledWith(jasmine.objectContaining({
            templateUrl: 'views/dialogs/quick-open.html',
            controller: 'DialogQuickOpenCtrl'
        }));
    });
});
