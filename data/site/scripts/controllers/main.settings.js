'use strict';

angular.module('app')
    .controller('SettingsCtrl', ['$scope', '$state', '$settings',
        function ($scope, $state, $settings) {

            $state.current.data = {
                title: 'Settings'
            };

            $scope.settings = $settings;

        }
    ]);
