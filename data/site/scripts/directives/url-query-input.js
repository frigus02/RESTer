'use strict';

angular.module('app')
    .directive('urlQueryInput', [function () {

        return {
            restrict: 'E',
            scope: {
                data: '='
            },
            templateUrl: 'views/directives/url-query-input.html',
            controller: function ($scope) {
                let knownData = '';
                let emptyParam = {name: '', value: ''};
                $scope.params = [];
                ensureEmptyParam();

                $scope.removeParam = function (index) {
                    if (index > -1) {
                        $scope.params.splice(index, 1);
                    }
                };

                $scope.$watch('params', function (oldValue, newValue) {
                    if (oldValue === newValue) return;
                    if (ensureEmptyParam()) return;

                    $scope.data = stringifyQueryParams($scope.params);
                    knownData = $scope.data;
                }, true);

                $scope.$watch('data', function () {
                    if ($scope.data !== knownData) {
                        $scope.params = parseQueryParams($scope.data);
                        knownData = $scope.data;
                    }
                });

                function ensureEmptyParam() {
                    if (!$scope.params.some(param => param.name.trim() === '' && param.value.trim() === '')) {
                        $scope.params.push(angular.copy(emptyParam));
                        return true;
                    } else {
                        return false;
                    }
                }

                function stringifyQueryParams(params) {
                    return params
                        .filter(param => param.name.trim())
                        .map(param => `${encodeURIComponent(param.name)}=${encodeURIComponent(param.value)}`)
                        .join('&');
                }

                function parseQueryParams(str) {
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
