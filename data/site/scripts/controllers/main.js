'use strict';

angular.module('app')
    .controller('MainCtrl', ['$scope', '$rester', function ($scope, $rester) {
        $scope.request = {
            method: 'GET',
            url: 'http://kuehle.me'
        };
        $scope.response = '';

        $scope.load = function () {
            $rester.load($scope.request).then(function (text) {
                $scope.response = JSON.stringify(text, null, 4);
                $scope.$apply();
            });
        };
    }]);
