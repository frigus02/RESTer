'use strict';

angular.module('app')
    .controller('DialogAuthorizationProviderBasicGenerateTokenCtrl', ['$scope', '$mdDialog', '$data', '$window',
        function ($scope, $mdDialog, $data, $window) {

            $scope.userName = '';
            $scope.password = '';

            $scope.cancel = function () {
                $mdDialog.cancel();
            };

            $scope.save = function () {
                let token = new $data.AuthorizationToken();
                token.title = $scope.userName;
                token.scheme = 'Basic';
                token.token = $window.btoa(`${$scope.userName}:${$scope.password}`);

                $mdDialog.hide(token);
            };

        }
    ]);
