'use strict';

angular.module('app')
    .controller('DialogAuthorizationProviderOAuth2ConfigurationCtrl', [
        '$scope', '$mdDialog', '$data', 'config',
        function ($scope, $mdDialog, $data, config) {
            
            $scope.config = config || new $data.AuthorizationProviderConfiguration();

            $scope.cancel = function() {
                $mdDialog.cancel();
            };

            $scope.save = function() {
                $mdDialog.hide($scope.config);
            };

            $scope.delete = function() {
                $mdDialog.hide('delete');
            };

        }
    ]);
