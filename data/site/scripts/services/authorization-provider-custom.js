'use strict';

angular.module('app')
    .factory('$authorizationProviderCustom', ['$authorization', '$mdDialog', function ($authorization, $mdDialog) {

        function AuthorizationProviderCustom() {
            $authorization.AuthorizationProvider.call(this, 1, 'Custom');
        }

        AuthorizationProviderCustom.prototype = new $authorization.AuthorizationProvider();

        AuthorizationProviderCustom.prototype.generateToken = function () {
            return $mdDialog.show({
                templateUrl: 'views/dialogs/authorization-provider-custom-generate-token.html',
                controller: 'DialogAuthorizationProviderCustomGenerateTokenCtrl'
            }).then(token => {
                token.title = `${token.scheme} ${token.token}`;
                token.providerId = 1;
                return token;
            });
        };

        return new AuthorizationProviderCustom();

    }]);
