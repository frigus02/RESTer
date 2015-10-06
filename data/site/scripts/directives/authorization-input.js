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
                    updateTokenIsUsedFlag();
                });

                function updateTokenIsUsedFlag() {
                    let authHeader = getAuthorizationHeaderValue();
                    $scope.tokens.forEach(token => {
                        token.isUsed = authHeader === `${token.scheme} ${token.token}`;
                    });
                }

                function getAuthorizationHeaderValue() {
                    let header = $scope.headers.find(h => h.name.toLowerCase() === 'authorization');
                    return header && header.value;
                }

                function removeAuthorizationHeader() {
                    while (true) {
                        let index = $scope.headers.findIndex(h => h.name.toLowerCase() === 'authorization');
                        if (index > -1) {
                            $scope.headers.splice(index, 1);
                        } else {
                            break;
                        }
                    }
                }

                $scope.$watch(getAuthorizationHeaderValue, updateTokenIsUsedFlag);

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
                    removeAuthorizationHeader();
                    if (token.isUsed) {
                        $scope.headers.push({
                            name: 'Authorization',
                            value: `${token.scheme} ${token.token}`
                        });
                    }
                };

                $scope.deleteToken = function (token) {
                    $data.deleteAuthorizationToken(token).then(() => {
                        let index = $scope.tokens.indexOf(token);
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
                                let index = $scope.configurations.findIndex(c => c.id === config.id);
                                if (index > 0) {
                                    $scope.configurations.splice(index, 1);
                                }
                            });
                        } else {
                            $data.putAuthorizationProviderConfiguration(newConfig).then(() => {
                                let index = $scope.configurations.findIndex(c => c.id === config.id);
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
