'use strict';

angular.module('app')
    .controller('DialogAuthorizationProviderOAuth2ConfigurationCtrl', ['$scope', '$mdDialog', 'config',
        function ($scope, $mdDialog, config) {

            $scope.config = config || {};
            if (!$scope.config.accessTokenRequestMethod) {
                $scope.config.accessTokenRequestMethod = 'POST';
            }
            if (!$scope.config.accessTokenRequestAuthentication) {
                $scope.config.accessTokenRequestAuthentication = 'basic';
            }

            $scope.flow = function (...flows) {
                return flows.indexOf($scope.config.flow) > -1;
            };

            $scope.cancel = function () {
                $mdDialog.cancel();
            };

            $scope.save = function () {
                $mdDialog.hide($scope.config);
            };

            $scope.delete = function () {
                $mdDialog.hide('delete');
            };

        }
    ]);
