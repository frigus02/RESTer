'use strict';

describe('controller: DialogSaveRequestCtrl', function () {
    beforeEach(module('app'));

    let $controller;
    let $q;
    let $rootScope;
    let $scope;
    let $mdDialog;
    let $data;
    let $dataGetRequestCollectionsDeferred;

    beforeEach(inject(function (_$controller_, _$q_, _$rootScope_) {
        $controller = _$controller_;
        $q = _$q_;
        $rootScope = _$rootScope_;
    }));

    beforeEach(function () {
        $scope = {};
        $mdDialog = jasmine.createSpyObj('$mdDialog', ['cancel', 'hide']);
        $dataGetRequestCollectionsDeferred = $q.defer();
        $data = {
            getRequestCollections: jasmine.createSpy().and.returnValue($dataGetRequestCollectionsDeferred.promise)
        };
    });


    beforeEach(function () {
        $controller('DialogSaveRequestCtrl', { $scope: $scope, $mdDialog: $mdDialog, $data: $data, isNew: false, collection: 'Google', title: 'Get Tasks', showHistoryWarning: false });
    });


    it('initializes properties with injected values', function () {
        expect($scope.isNew).toBe(false);
        expect($scope.collection).toBe('Google');
        expect($scope.title).toBe('Get Tasks');
        expect($scope.showHistoryWarning).toBe(false);

        expect($scope.overwrite).toBe(true);
    });

    it('returns filtered collections on queryCollections', function () {
        let result;

        // Calling method without a search should return a promise with all
        // collections inside.
        result = $scope.queryCollections();
        expect(result.$$state.status).toBe(0);

        $dataGetRequestCollectionsDeferred.resolve(['JsonPlaceholder', 'Google']);
        $rootScope.$apply();

        expect(result.$$state.status).toBe(1);
        expect(result.$$state.value).toEqual(['JsonPlaceholder', 'Google']);

        // On the following calls data should be cached and method should just
        // return the result.
        result = $scope.queryCollections('goo');
        expect(result).toEqual(['Google']);
    });

    it('closes dialog on cancel', function () {
        $scope.cancel();

        expect($mdDialog.cancel).toHaveBeenCalled();
    });

    it('generates and returns token on save', function () {
        $scope.collection = 'New Collection';
        $scope.title = 'New Title';
        $scope.overwrite = false;

        $scope.save();

        expect($mdDialog.hide).toHaveBeenCalledWith({
            collection: 'New Collection',
            title: 'New Title',
            overwrite: false
        });
    });
});
