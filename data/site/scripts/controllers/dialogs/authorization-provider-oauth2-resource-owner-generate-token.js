'use strict';

angular.module('app')
    .controller('DialogAuthorizationProviderOAuth2ResourceOwnerGenerateTokenCtrl', ['$scope', '$mdDialog',
        function ($scope, $mdDialog) {

            $scope.username = '';
            $scope.password = '';

            $scope.cancel = function () {
                $mdDialog.cancel();
            };

            $scope.save = function () {
                $mdDialog.hide({
                    username: $scope.username,
                    password: $scope.password
                });
            };

        }
    ]);
