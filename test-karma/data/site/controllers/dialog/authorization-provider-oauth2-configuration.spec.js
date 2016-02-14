'use strict';

describe('controller: DialogAuthorizationProviderOAuth2ConfigurationCtrl', function () {
    beforeEach(module('app'));

    let $controller;
    let $scope;
    let $mdDialog;
    let $data;

    beforeEach(function () {
        $scope = {};
        $mdDialog = jasmine.createSpyObj('$mdDialog', ['cancel', 'hide']);
        $data = {
            AuthorizationProviderConfiguration: function () {}
        };
    });

    beforeEach(inject(function (_$controller_) {
        $controller = _$controller_;
    }));


    describe('create new token', function () {
        beforeEach(function () {
            $controller('DialogAuthorizationProviderOAuth2ConfigurationCtrl', { $scope: $scope, $mdDialog: $mdDialog, $data: $data, config: undefined });
        });


        it('initializes config with an empty AuthorizationProviderConfiguration object', function () {
            expect($scope.config).toEqual(jasmine.any($data.AuthorizationProviderConfiguration));
            expect($scope.config.accessTokenRequestMethod).toBe('POST');
            expect($scope.config.accessTokenRequestAuthentication).toBe('basic');
        });

        it('returns true when the selected oauth2 flow is included in the arguments', function () {
            $scope.config.flow = 'foo';

            expect($scope.flow('test', 'foo', 'bar')).toBe(true);
            expect($scope.flow('test', 'bar')).toBe(false);
        });

        it('closes dialog on cancel', function () {
            $scope.cancel();

            expect($mdDialog.cancel).toHaveBeenCalled();
        });

        it('generates and returns token on save', function () {
            $scope.save();

            expect($mdDialog.hide).toHaveBeenCalledWith($scope.config);
        });
    });

    describe('edit existing token', function () {
        let config = { foo: 'bar' };

        beforeEach(function () {
            $controller('DialogAuthorizationProviderOAuth2ConfigurationCtrl', { $scope: $scope, $mdDialog: $mdDialog, $data: $data, config: config });
        });


        it('initializes config with injected config object', function () {
            expect($scope.config).toBe(config);
        });

        it('returns "delete" on delete', function () {
            $scope.delete();

            expect($mdDialog.hide).toHaveBeenCalledWith('delete');
        });
    });
});
