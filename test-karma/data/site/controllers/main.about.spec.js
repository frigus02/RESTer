'use strict';

describe('controller: AboutCtrl', function () {
    beforeEach(module('app'));

    let $controller;
    let $q;
    let $rootScope;

    let $scope;
    let $state;
    let $rester;

    let $resterGetInfoDeferred;

    beforeEach(inject(function (_$controller_, _$q_, _$rootScope_) {
        $controller = _$controller_;
        $q = _$q_;
        $rootScope = _$rootScope_;
    }));

    beforeEach(function () {
        $scope = {};
        $state = {
            current: {}
        };
        $resterGetInfoDeferred = $q.defer();
        $rester = {
            getInfo: jasmine.createSpy().and.returnValue($resterGetInfoDeferred.promise)
        };
    });


    beforeEach(function () {
        $controller('AboutCtrl', { $scope: $scope, $state: $state, $rester: $rester });
    });


    it('initializes properties', function () {
        expect($state.current.data.title).toBe('About');

        expect($scope.version).toBe('');

        expect($scope.libraries.length).toBeGreaterThan(0);
    });

    it('loads version from rester on load', function () {
        expect($scope.version).toBe('');
        expect($rester.getInfo).toHaveBeenCalled();

        $resterGetInfoDeferred.resolve({version: '1.2.3'});
        $rootScope.$apply();

        expect($scope.version).toBe('1.2.3');
    });
});
