'use strict';

angular.module('app')
    .directive('variablesInput', ['$variables', function ($variables) {

        let cachedValues = {};

        return {
            restrict: 'E',
            scope: {
                values: '=ngModel',
                sourceObj: '=',
                enabled: '='
            },
            templateUrl: 'views/directives/variables-input.html',
            controller: function ($scope) {
                $scope.varNames = [];

                $scope.$watch('values', function () {
                    Object.assign(cachedValues, $scope.values);
                }, true);

                $scope.$watchCollection('varNames', function () {
                    for (let varName of $scope.varNames) {
                        if (!$scope.values[varName]) {
                            $scope.values[varName] = cachedValues[varName];
                        }
                    }
                });

                $scope.$watch('sourceObj', _.debounce(function () {
                    $scope.$applyAsync(function () {
                        $scope.varNames = $variables.extract($scope.sourceObj);
                    });
                }, 300), true);
            }
        };

    }]);
