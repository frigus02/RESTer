'use strict';

describe('controller: DialogQuickOpenCtrl', function () {
    beforeEach(module('app'));

    let $controller;
    let $q;
    let $rootScope;
    let $scope;
    let $mdDialog;
    let $data;
    let $dataGetRequestsDeferred;
    let $state;
    let LiquidMetalScore;

    beforeEach(inject(function (_$controller_, _$q_, _$rootScope_) {
        $controller = _$controller_;
        $q = _$q_;
        $rootScope = _$rootScope_;
    }));

    beforeEach(function () {
        $scope = {};
        $mdDialog = jasmine.createSpyObj('$mdDialog', ['cancel', 'hide']);
        $dataGetRequestsDeferred = $q.defer();
        $data = {
            Request: function () {},
            getRequests: jasmine.createSpy().and.returnValue($dataGetRequestsDeferred.promise)
        };
        $state = {
            go: jasmine.createSpy()
        };
        LiquidMetalScore = spyOn(window.LiquidMetal, 'score').and.callThrough();
    });

    beforeEach(function () {
        $controller('DialogQuickOpenCtrl', { $scope: $scope, $mdDialog: $mdDialog, $data: $data, $state: $state });
    });


    it('initializes searchText with an empty string', function () {
        expect($data.getRequests).toHaveBeenCalled();
        expect($scope.searchText).toBe('');
    });

    it('waits for getRequests promise on queryItems', function () {
        let result = $scope.queryItems('po');

        expect(LiquidMetalScore).not.toHaveBeenCalled();
        expect(result.$$state.status).toBe(0);

        $dataGetRequestsDeferred.resolve([
            { collection: 'JsonPlaceholder', title: 'Get Posts' },
            { collection: 'JsonPlaceholder', title: 'Create Post' },
            { collection: 'Google', title: 'Get User Profile' },
            { collection: 'Google', title: 'Get Tasks' }
        ]);
        $rootScope.$apply();

        expect(LiquidMetalScore).toHaveBeenCalled();
        expect(result.$$state.status).toBe(1);
        expect(result.$$state.value.length).toBe(3);
        expect(result.$$state.value[0].title).toBe('JsonPlaceholder / Create Post');
    });

    it('waits for getRequests promise on queryItems', function () {
        $dataGetRequestsDeferred.resolve([
            { collection: 'JsonPlaceholder', title: 'Get Posts' },
            { collection: 'Google', title: 'Get Tasks' }
        ]);
        $rootScope.$apply();

        let result = $scope.queryItems('GoogTa');

        expect(LiquidMetalScore).toHaveBeenCalled();
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
        item.data = new $data.Request();
        item.data.id = 1;

        $scope.openItem(item);

        expect($mdDialog.hide).toHaveBeenCalled();
        expect($state.go).toHaveBeenCalledWith('main.request.existing', {id: 1});
    });
});
