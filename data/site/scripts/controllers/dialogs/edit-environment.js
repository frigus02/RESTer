'use strict';

angular.module('app')
    .controller('DialogEditEnvironmentCtrl', ['$scope', '$mdDialog', '$data', 'environment',
        function ($scope, $mdDialog, $data, environment) {

            $scope.environment = environment || new $data.Environment();
            $scope.values = Object.keys($scope.environment.values).map(key => ({
                key: key,
                value: $scope.environment.values[key]
            }));

            function ensureEmptyValue() {
                if (!$scope.values.some(value => value.key.trim() === '' && value.value.trim() === '')) {
                    $scope.values.push({key: '', value: ''});
                    return true;
                } else {
                    return false;
                }
            }

            $scope.$watch('values', ensureEmptyValue, true);

            $scope.removeValue = function (index) {
                $scope.values.splice(index, 1);
            };

            $scope.cancel = function () {
                $mdDialog.cancel();
            };

            $scope.save = function () {
                $scope.environment.values = {};
                $scope.values.forEach(value => {
                    if (value.key.trim() !== '') {
                        $scope.environment.values[value.key] = value.value;
                    }
                });

                $mdDialog.hide($scope.environment);
            };

            $scope.delete = function () {
                $mdDialog.hide('delete');
            };

        }
    ]);
