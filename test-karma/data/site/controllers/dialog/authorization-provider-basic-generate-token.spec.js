'use strict';

describe('controller: DialogAuthorizationProviderBasicGenerateTokenCtrl', function () {
    beforeEach(module('app'));

    let $controller;
    let $scope;
    let $mdDialog;
    let $data;
    let $window;

    beforeEach(function () {
        $scope = {};
        $mdDialog = jasmine.createSpyObj('$mdDialog', ['cancel', 'hide']);
        $data = {
            AuthorizationToken: function () {}
        };
        $window = {
            btoa: jasmine.createSpy().and.returnValue('base64string')
        };
    });

    beforeEach(inject(function (_$controller_) {
        $controller = _$controller_;
    }));

    beforeEach(function () {
        $controller('DialogAuthorizationProviderBasicGenerateTokenCtrl', { $scope: $scope, $mdDialog: $mdDialog, $data: $data, $window: $window });
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

        expect($mdDialog.hide).toHaveBeenCalledWith(jasmine.any($data.AuthorizationToken));
        expect($mdDialog.hide).toHaveBeenCalledWith(jasmine.objectContaining({
            title: $scope.userName,
            scheme: 'Basic',
            token: 'base64string'
        }));
    });
});
