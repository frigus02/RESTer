'use strict';

angular.module('app')
    .factory('$authorizationProviderCustom', ['$authorization', '$mdDialog', function ($authorization, $mdDialog) {
        
        function AuthorizationProviderCustom() {
            $authorization.AuthorizationProvider.call(this, 1, 'Custom');
        }

        AuthorizationProviderCustom.prototype = new $authorization.AuthorizationProvider();

        AuthorizationProviderCustom.prototype.generateToken = function () {

        };

        return new AuthorizationProviderCustom();

    }]);
