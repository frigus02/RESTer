'use strict';

angular.module('app')
    .controller('RequestCtrl', ['$scope', '$state', '$rester', function ($scope, $state, $rester) {
        
        $state.current.data = {
            title: '<no collection> / <no title>',
            actions: [
                {
                    title: 'Save request',
                    icon: 'save',
                    action: saveRequest
                },
                {
                    title: 'View request history',
                    icon: 'history',
                    action: showRequestHistory
                }
            ]
        };

        $scope.request = {
            method: 'GET',
            url: 'http://www.thomas-bayer.com/sqlrest/customer/',
            headers: [],
            body: ''
        };

        $scope.requestIsSending = false;

        $scope.sendRequest = function () {
            $scope.requestIsSending = true;
            $rester.load($scope.request)
                .then(r => {
                    $scope.requestIsSending = false;
                    $scope.response = r;
                    $scope.$apply();
                })
                .catch(e => {
                    $scope.requestIsSending = false;
                    alert(e);
                });
        };

        function saveRequest() {

        }

        function showRequestHistory() {

        }

    }]);
