'use strict';

describe('controller: DialogAuthorizationProviderBasicGenerateTokenCtrl', function () {
    beforeEach(module('app'));

    let $controller;
    let $scope;
    let $mdDialog;
    let $window;

    beforeEach(function () {
        $scope = {};
        $mdDialog = jasmine.createSpyObj('$mdDialog', ['cancel', 'hide']);
        $window = {
            btoa: jasmine.createSpy().and.returnValue('base64string')
        };
    });

    beforeEach(inject(function (_$controller_) {
        $controller = _$controller_;
    }));

    beforeEach(function () {
        $controller('DialogAuthorizationProviderBasicGenerateTokenCtrl', { $scope: $scope, $mdDialog: $mdDialog, $window: $window });
    });


    it('initializes userName and password with an empty string', function () {
        expect($scope.userName).toBe('');
        expect($scope.password).toBe('');
    });

    it('closes dialog on cancel', function () {
        $scope.cancel();

        expect($mdDialog.cancel).toHaveBeenCalled();
    });

    it('generates and returns token on save', function () {
        $scope.userName  = 'foo';
        $scope.password  = 'bar';

        $scope.save();

        expect($mdDialog.hide).toHaveBeenCalledWith(jasmine.objectContaining({
            title: $scope.userName,
            scheme: 'Basic',
            token: 'base64string'
        }));
    });
});
