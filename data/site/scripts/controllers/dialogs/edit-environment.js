'use strict';

angular.module('app')
    .controller('DialogEditEnvironmentCtrl', ['$scope', '$mdDialog', '$data', 'environment',
        function ($scope, $mdDialog, $data, environment) {

            $scope.environment = environment || new $data.Environment();
            $scope.values = Object.keys($scope.environment.values).map(key => ({
                name: key,
                value: $scope.environment.values[key]
            }));

            function ensureEmptyValue() {
                if (!$scope.values.some(value => value.name.trim() === '' && value.value.trim() === '')) {
                    $scope.values.push({name: '', value: ''});
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
                    if (value.name.trim() !== '') {
                        $scope.environment.values[value.name] = value.value;
                    }
                });

                $mdDialog.hide($scope.environment);
            };

            $scope.delete = function () {
                $mdDialog.hide('delete');
            };

        }
    ]);
