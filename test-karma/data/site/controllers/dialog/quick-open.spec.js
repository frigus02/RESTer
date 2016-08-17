'use strict';

describe('controller: DialogQuickOpenCtrl', function () {
    beforeEach(module('app'));

    let $controller;
    let $q;
    let $rootScope;
    let $scope;
    let $mdDialog;
    let $rester;
    let $resterGetRequestsDeferred;
    let $state;
    let string_score;

    beforeEach(inject(function (_$controller_, _$q_, _$rootScope_) {
        $controller = _$controller_;
        $q = _$q_;
        $rootScope = _$rootScope_;
    }));

    beforeEach(function () {
        $scope = {};
        $mdDialog = jasmine.createSpyObj('$mdDialog', ['cancel', 'hide']);
        $resterGetRequestsDeferred = $q.defer();
        $rester = {
            Request: function () {},
            getRequests: jasmine.createSpy().and.returnValue($resterGetRequestsDeferred.promise)
        };
        $state = {
            go: jasmine.createSpy()
        };
        string_score = spyOn(String.prototype, 'score').and.callThrough();
    });

    beforeEach(function () {
        $controller('DialogQuickOpenCtrl', { $scope: $scope, $mdDialog: $mdDialog, $rester: $rester, $state: $state });
    });


    it('initializes searchText with an empty string', function () {
        expect($rester.getRequests).toHaveBeenCalled();
        expect($scope.searchText).toBe('');
    });

    it('waits for getRequests promise on queryItems', function () {
        let result = $scope.queryItems('po');

        expect(string_score).not.toHaveBeenCalled();
        expect(result.$$state.status).toBe(0);

        $resterGetRequestsDeferred.resolve([
            { collection: 'JsonPlaceholder', title: 'Get Posts' },
            { collection: 'JsonPlaceholder', title: 'Create Post' },
            { collection: 'Google', title: 'Get User Profile' },
            { collection: 'Google', title: 'Get Tasks' }
        ]);
        $rootScope.$apply();

        expect(string_score).toHaveBeenCalled();
        expect(result.$$state.status).toBe(1);
        expect(result.$$state.value.length).toBe(3);
        expect(result.$$state.value[0].title).toBe('Google / Get User Profile');
    });

    it('waits for getRequests promise on queryItems', function () {
        $resterGetRequestsDeferred.resolve([
            { collection: 'JsonPlaceholder', title: 'Get Posts' },
            { collection: 'Google', title: 'Get Tasks' }
        ]);
        $rootScope.$apply();

        let result = $scope.queryItems('GoogTa');

        expect(string_score).toHaveBeenCalled();
        expect(result.length).toBe(1);
        expect(result[0].title).toBe('Google / Get Tasks');
    });

    it('closes dialog on openItem', function () {
        $scope.openItem();

        expect($mdDialog.hide).toHaveBeenCalled();
        expect($state.go).not.toHaveBeenCalled();
    });

    it('closes dialog on openItem and navigates to specified item', function () {
        let item = {};
        item.data = {};
        item.data.id = 1;

        $scope.openItem(item);

        expect($mdDialog.hide).toHaveBeenCalled();
        expect($state.go).toHaveBeenCalledWith('main.request.existing', {id: 1});
    });
});
