'use strict';

describe('controller: DialogAuthorizationProviderOAuth2ResourceOwnerGenerateTokenCtrl', function () {
    beforeEach(module('app'));

    let $controller;
    let $scope;
    let $mdDialog;

    beforeEach(function () {
        $scope = {};
        $mdDialog = jasmine.createSpyObj('$mdDialog', ['cancel', 'hide']);
    });

    beforeEach(inject(function (_$controller_) {
        $controller = _$controller_;
    }));

    beforeEach(function () {
        $controller('DialogAuthorizationProviderOAuth2ResourceOwnerGenerateTokenCtrl', { $scope: $scope, $mdDialog: $mdDialog });
    });


    it('initializes username and password with an empty string', function () {
        expect($scope.username).toBe('');
        expect($scope.password).toBe('');
    });

    it('closes dialog on cancel', function () {
        $scope.cancel();

        expect($mdDialog.cancel).toHaveBeenCalled();
    });

    it('generates and returns token on save', function () {
        $scope.username  = 'foo';
        $scope.password  = 'bar';

        $scope.save();

        expect($mdDialog.hide).toHaveBeenCalledWith(jasmine.objectContaining({
            username: 'foo',
            password: 'bar'
        }));
    });
});
