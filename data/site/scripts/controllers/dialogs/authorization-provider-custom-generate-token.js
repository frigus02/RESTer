'use strict';

angular.module('app')
    .controller('DialogAuthorizationProviderCustomGenerateTokenCtrl', ['$scope', '$mdDialog', '$data',
        function ($scope, $mdDialog, $data) {
            
            $scope.token = new $data.AuthorizationToken();

            $scope.cancel = function() {
                $mdDialog.cancel();
            };

            $scope.save = function() {
                $mdDialog.hide($scope.token);
            };

        }
    ]);
