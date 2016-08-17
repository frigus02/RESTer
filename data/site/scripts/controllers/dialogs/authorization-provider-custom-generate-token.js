'use strict';

angular.module('app')
    .controller('DialogAuthorizationProviderCustomGenerateTokenCtrl', ['$scope', '$mdDialog',
        function ($scope, $mdDialog) {

            $scope.token = {};

            $scope.cancel = function () {
                $mdDialog.cancel();
            };

            $scope.save = function () {
                $mdDialog.hide($scope.token);
            };

        }
    ]);
