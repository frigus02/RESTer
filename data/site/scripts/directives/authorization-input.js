'use strict';

angular.module('app')
    .directive('authorizationInput', ['$authorization', '$data', '$error', function ($authorization, $data, $error) {

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

                $scope.$watch('headers.Authorization', function () {
                    $scope.tokens.forEach(token => {
                        token.isUsed = $scope.headers.Authorization === `${token.scheme} ${token.token}`;
                    });
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
                };

                $scope.getConfigurationById = function (id) {
                    return $scope.configurations.find(c => c.id === id);
                };

                $scope.changeTokenUsage = function (token) {
                    if (!token.isUsed) {
                        delete $scope.headers.Authorization;
                    } else {
                        $scope.headers.Authorization = `${token.scheme} ${token.token}`;
                    }
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
                    $scope.getProviderById(config.providerId).generateToken(config)
                        .then(token => {
                            $data.addAuthorizationToken(token);
                            $scope.tokens.push(token);

                            token.isUsed = true;
                            $scope.changeTokenUsage(token);
                        })
                        .catch(error => {
                            if (error) {
                                $error.show(error);
                            }
                        });
                };

                $scope.editConfiguration = function (config) {
                    $scope.getProviderById(config.providerId).editConfiguration(config).then(newConfig => {
                        if (newConfig === 'delete') {
                            $data.deleteAuthorizationProviderConfiguration(config).then(() => {
                                var index = $scope.configurations.findIndex(c => c.id === config.id);
                                if (index > 0) {
                                    $scope.configurations.splice(index, 1);
                                }
                            });
                        } else {
                            $data.putAuthorizationProviderConfiguration(newConfig).then(() => {
                                var index = $scope.configurations.findIndex(c => c.id === config.id);
                                if (index > 0) {
                                    $scope.configurations.splice(index, 1, newConfig);
                                } else {
                                    $scope.configurations.push(newConfig);
                                }
                            });
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
