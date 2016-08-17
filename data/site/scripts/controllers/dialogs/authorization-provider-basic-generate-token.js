'use strict';

angular.module('app')
    .controller('DialogAuthorizationProviderBasicGenerateTokenCtrl', ['$scope', '$mdDialog', '$window',
        function ($scope, $mdDialog, $window) {

            $scope.userName = '';
            $scope.password = '';

            $scope.cancel = function () {
                $mdDialog.cancel();
            };

            $scope.save = function () {
                let token = {};
                token.title = $scope.userName;
                token.scheme = 'Basic';
                token.token = $window.btoa(`${$scope.userName}:${$scope.password}`);

                $mdDialog.hide(token);
            };

        }
    ]);
