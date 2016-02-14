'use strict';

describe('controller: DialogAuthorizationProviderCustomGenerateTokenCtrl', function () {
    beforeEach(module('app'));

    let $controller;
    let $scope;
    let $mdDialog;
    let $data;

    beforeEach(function () {
        $scope = {};
        $mdDialog = jasmine.createSpyObj('$mdDialog', ['cancel', 'hide']);
        $data = {
            AuthorizationToken: function () {}
        };
    });

    beforeEach(inject(function (_$controller_) {
        $controller = _$controller_;
    }));

    beforeEach(function () {
        $controller('DialogAuthorizationProviderCustomGenerateTokenCtrl', { $scope: $scope, $mdDialog: $mdDialog, $data: $data });
    });


    it('initializes token with an empty AuthorizationToken object', function () {
        expect($scope.token).toEqual(jasmine.any($data.AuthorizationToken));
    });

    it('closes dialog on cancel', function () {
        $scope.cancel();

        expect($mdDialog.cancel).toHaveBeenCalled();
    });

    it('generates and returns token on save', function () {
        $scope.token.scheme  = 'foo';
        $scope.token.token  = 'bar';

        $scope.save();

        expect($mdDialog.hide).toHaveBeenCalledWith($scope.token);
    });
});
