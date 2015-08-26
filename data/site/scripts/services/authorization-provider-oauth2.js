'use strict';

angular.module('app')
    .factory('$authorizationProviderOAuth2', ['$authorization', '$mdDialog', function ($authorization, $mdDialog) {
        
        function AuthorizationProviderOAuth2() {
            $authorization.AuthorizationProvider.call(this, 3, 'OAuth 2', true);
        }

        AuthorizationProviderOAuth2.prototype = new $authorization.AuthorizationProvider();

        function generateUri(base, params) {
            return base + '?' + Object.keys(params)
                .map(p => `${p}=${encodeURIComponent(params[p])}`)
                .join('&');;
        }

        AuthorizationProviderOAuth2.prototype.generateToken = function (config) {
            var params = {
                response_type: config.responseType,
                client_id: config.clientId,
                redirect_uri: config.redirectUri
            };

            if (config.scope) {
                params.scope = config.scope;
            }

            if (config.state) {
                params.state = config.state;
            }

            window.open(generateUri(config.authorizationEndpoint, params));
        };

        AuthorizationProviderOAuth2.prototype.createConfiguration = function () {
            return this.editConfiguration({});
        };

        AuthorizationProviderOAuth2.prototype.editConfiguration = function (config) {
            config.providerId = 3;

            return $mdDialog.show({
                templateUrl: 'views/dialogs/authorization-provider-oauth2-configuration.html',
                controller: 'DialogAuthorizationProviderOAuth2ConfigurationCtrl',
                locals: {
                    config: config
                }
            });
        };

        return new AuthorizationProviderOAuth2();

    }]);
