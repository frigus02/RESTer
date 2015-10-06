'use strict';

angular.module('app')
    .factory('$authorizationProviderBasic', ['$authorization', '$mdDialog', function ($authorization, $mdDialog) {

        function AuthorizationProviderBasic() {
            $authorization.AuthorizationProvider.call(this, 2, 'Basic');
        }

        AuthorizationProviderBasic.prototype = new $authorization.AuthorizationProvider();

        AuthorizationProviderBasic.prototype.generateToken = function () {
            return $mdDialog.show({
                templateUrl: 'views/dialogs/authorization-provider-basic-generate-token.html',
                controller: 'DialogAuthorizationProviderBasicGenerateTokenCtrl'
            }).then(token => {
                token.providerId = 2;
                return token;
            });
        };

        return new AuthorizationProviderBasic();

    }]);
