'use strict';

angular.module('app')
    .directive('formDataInput', [function () {

        return {
            restrict: 'E',
            scope: {
                data: '='
            },
            templateUrl: 'views/directives/form-data-input.html',
            controller: function ($scope) {
                let knownData = '';
                $scope.rows = [];

                $scope.removeRow = function (index) {
                    if (index > -1) {
                        $scope.rows.splice(index, 1);
                    }
                };

                $scope.$watch('rows', function (oldValue, newValue) {
                    if (oldValue === newValue) return;
                    if (ensureEmptyRow()) return;

                    $scope.data = stringifyFormData($scope.rows);
                    knownData = $scope.data;
                }, true);

                $scope.$watch('data', function () {
                    if ($scope.data !== knownData) {
                        $scope.rows = parseFormData($scope.data);
                        knownData = $scope.data;
                    }
                });

                function ensureEmptyRow() {
                    if (!$scope.rows.some(row => row.name.trim() === '' && row.value.trim() === '')) {
                        $scope.rows.push({name: '', value: ''});
                        return true;
                    } else {
                        return false;
                    }
                }

                function stringifyFormData(rows) {
                    return rows
                        .filter(row => row.name.trim())
                        .map(row => `${encodeURIComponent(row.name)}=${encodeURIComponent(row.value)}`)
                        .join('&');
                }

                function parseFormData(str) {
                    return (str || '')
                        .split('&')
                        .map(row => {
                            let keyValue = row.split('=');
                            return {
                                name: decodeURIComponent(keyValue[0]),
                                value: decodeURIComponent(keyValue[1])
                            };
                        })
                        .filter(row => row.name.trim());
                }

            }
        };

    }]);
