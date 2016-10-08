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
                $scope.providedVarNames = [];
                $scope.providedValues = {};

                $scope.$watch('values', function () {
                    Object.assign(cachedValues, $scope.values);
                }, true);

                $scope.$watch(() => JSON.stringify($variables.getProvidedValues()), function () {
                    $scope.providedValues = $variables.getProvidedValues();
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
                        let varNames = $variables.extract($scope.sourceObj);
                        $scope.varNames = varNames.filter(n => !n.startsWith('$'));
                        $scope.providedVarNames = varNames.filter(n => n.startsWith('$'));
                    });
                }, 300), true);
            }
        };

    }]);
