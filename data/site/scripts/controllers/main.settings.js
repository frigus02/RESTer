'use strict';

angular.module('app')
    .controller('SettingsCtrl', ['$scope', '$state', '$rester',
        function ($scope, $state, $rester) {

            $state.current.data = {
                title: 'Settings'
            };

            $scope.settings = $rester.settings;

        }
    ]);
