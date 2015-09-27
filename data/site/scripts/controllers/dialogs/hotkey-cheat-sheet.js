'use strict';

angular.module('app')
    .controller('DialogHotkeyCheatSheetCtrl', ['$scope', '$mdDialog', '$hotkeys',
        function ($scope, $mdDialog, $hotkeys) {

            $scope.hotkeys = $hotkeys.getAll();

            $scope.close = function () {
                $mdDialog.hide();
            };

        }
    ]);
