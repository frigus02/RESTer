'use strict';

angular.module('app')
    .directive('authorizationInput', ['$authorization', '$data', function ($authorization, $data) {

        return {
            restrict: 'E',
            scope: {
                headers: '='
            },
            templateUrl: 'views/directives/authorization-input.html',
            controller: function ($scope) {
                $scope.tokens = [];
                $data.getAuthorizationTokens().then(tokens => {
                    $scope.tokens = tokens;
                });

                $scope.configurations = [];
                $scope.providers = [];
                $authorization.getProviders().forEach(provider => {
                    if (provider.needsConfiguration) {
                        $scope.providers.push(provider);

                        $data.getAuthorizationProviderConfigurations(provider.id).then(configs => {
                            configs.forEach(config => {
                                $scope.configurations.push(config);
                            });
                        });
                    } else {
                        $scope.configurations.push({
                            providerId: provider.id
                        });
                    }
                });

                $scope.getProviderById = function (id) {
                    return $authorization.getProviders().find(p => p.id === id);
                }

                $scope.useToken = function (token) {
                    $scope.headers.Authorization = `${token.scheme} ${token.token}`;
                };

                $scope.isTokenUsed = function (token) {
                    return $scope.headers.Authorization === `${token.scheme} ${token.token}`;
                };

                $scope.deleteToken = function (token) {
                    $data.deleteAuthorizationToken(token).then(() => {
                        var index = $scope.tokens.indexOf(token);
                        if (index > -1) {
                            $scope.tokens.splice(index, 1);
                        }
                    });
                };

                $scope.generateNewToken = function (config) {
                    $scope.getProviderById(config.providerId).generateToken(config).then(token => {
                        $data.addAuthorizationToken(token);
                        $scope.tokens.push(token);
                        $scope.useToken(token);
                    });
                };

                $scope.editConfiguration = function (config) {
                    $scope.getProviderById(config.providerId).editConfiguration(config).then(config => {
                        $data.putAuthorizationProviderConfiguration(config);
                        
                        var index = $scope.configurations.findIndex(c => c.id === config.id);
                        if (index > 0) {
                            $scope.configurations.splice(index, 1, config);
                        } else {
                            $scope.configurations.push(config);
                        }
                    });
                };

                $scope.createConfiguration = function (provider) {
                    provider.createConfiguration().then(config => {
                        $data.putAuthorizationProviderConfiguration(config);
                        $scope.configurations.push(config);
                    });
                };
            }
        };

    }]);
