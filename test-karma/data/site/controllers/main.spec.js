'use strict';

describe('controller: MainCtrl', function () {
    beforeEach(module('app'));

    let $controller;
    let $rootScope;
    let $q;

    let $scope;
    let $mdSidenav;
    let $state;
    let $rester;
    let $hotkeys;
    let $mdDialog;
    let $navigation;

    let $mdSidenavInstance;
    let $resterGetEnvironmentDeferred;
    let $resterGetEnvironmentsDeferred;

    let fakeEnvironments;

    beforeEach(inject(function (_$controller_, _$q_, _$rootScope_) {
        $controller = _$controller_;
        $q = _$q_;
        $rootScope = _$rootScope_;
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

        $resterGetEnvironmentDeferred = $q.defer();
        $resterGetEnvironmentsDeferred = $q.defer();
        $rester = {
            getEnvironment: jasmine.createSpy().and.returnValue($resterGetEnvironmentDeferred.promise),
            getEnvironments: jasmine.createSpy().and.returnValue($resterGetEnvironmentsDeferred.promise),
            settings: {
                activeEnvironment: 1
            }
        };

        $hotkeys = {
            Hotkey: function (props) {
                Object.assign(this, props);
            },
            showCheatSheet: jasmine.createSpy(),
            add: jasmine.createSpy()
        };

        $mdDialog = jasmine.createSpyObj('$mdDialog', ['show']);

        $navigation = {
            items: [1, 2, 3]
        };

        fakeEnvironments = [
            {id: 1, name: 'dev', values: {}},
            {id: 3, name: 'prod', values: {}}
        ];
    });


    beforeEach(function () {
        $controller('MainCtrl', { $scope, $rootScope, $mdSidenav, $state, $rester, $hotkeys, $mdDialog, $navigation });
    });


    it('initializes properties', function () {
        expect($scope.navItems).toBe($navigation.items);

        expect($hotkeys.add).toHaveBeenCalledTimes(3);
        expect($hotkeys.add).toHaveBeenCalledWith(jasmine.any($hotkeys.Hotkey), $scope);
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
        expect($scope.$watch).toHaveBeenCalledWith(jasmine.any(Function), jasmine.any(Function));
        expect($rootScope.title).not.toBeDefined();

        let [watchExpression, watchListener] = $scope.$watch.calls.argsFor(0);

        // Expression: string
        let exprTitle = 'test';
        spyOn($scope, 'getTitle').and.callFake(() => exprTitle);

        let exprResult = watchExpression();
        expect($scope.getTitle).toHaveBeenCalledTimes(1);
        expect(exprResult).toBe(exprTitle);

        exprTitle = {
            getAsString: jasmine.createSpy().and.returnValue('test')
        };

        exprResult = watchExpression();
        expect($scope.getTitle).toHaveBeenCalledTimes(2);
        expect(exprResult).toBe('test');

        // Listener
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

    it('cycle through environments on third hotkey callback', function () {
        let hotkey = $hotkeys.add.calls.argsFor(2)[0];

        expect(hotkey.combos).toEqual(['mod+e']);

        // First callback (2 envs --> switch to second one)
        hotkey.callback();

        expect($rester.getEnvironments).toHaveBeenCalledTimes(1);

        $resterGetEnvironmentsDeferred.resolve(fakeEnvironments);
        $rootScope.$apply();

        expect($rester.settings.activeEnvironment).toBe(3);

        // Second callback (2 envs --> switch to first one again)
        hotkey.callback();

        expect($rester.getEnvironments).toHaveBeenCalledTimes(2);

        $resterGetEnvironmentsDeferred.resolve(fakeEnvironments);
        $rootScope.$apply();

        expect($rester.settings.activeEnvironment).toBe(1);
    });

    it('cycle through environments on third hotkey callback (don\'t crash, when no envs exist)', function () {
        let hotkey = $hotkeys.add.calls.argsFor(2)[0];

        expect(hotkey.combos).toEqual(['mod+e']);

        // Third callback (no envs --> do nothing)
        hotkey.callback();

        expect($rester.getEnvironments).toHaveBeenCalledTimes(1);

        $resterGetEnvironmentsDeferred.resolve([]);
        $rootScope.$apply();
    });
});
