'use strict';

angular.module('app')
    .directive('urlInput', [function () {

        return {
            restrict: 'E',
            require: '?ngModel',
            scope: {},
            templateUrl: 'views/directives/url-input.html',
            link: function(scope, element, attrs, ngModel) {
                ngModel.$render = function () {
                    scope.url.absolute = ngModel.$viewValue || '';
                };

                scope.$watch('url.absolute', function (url) {
                    if (attrs.required) {
                        ngModel.$setValidity('required', !!url);
                    }

                    ngModel.$setViewValue(url);
                });
            },
            controller: function ($scope) {
                let knownUrl = '';

                $scope.settings = {
                    expanded: false
                };

                $scope.url = {
                    absolute: '',
                    originAndPath: '',
                    query: ''
                };

                $scope.$watch('url.absolute', function () {
                    if ($scope.url.absolute !== knownUrl) {
                        [$scope.url.originAndPath, $scope.url.query = ''] = $scope.url.absolute.split('?');
                        knownUrl = $scope.url.absolute;
                    }
                });

                $scope.$watchGroup(['url.originAndPath', 'url.query'], function () {
                    $scope.url.absolute = $scope.url.originAndPath;
                    if ($scope.url.query) {
                        $scope.url.absolute += '?' + $scope.url.query;
                    }

                    knownUrl = $scope.url.absolute;
                });
            }
        };

    }]);
