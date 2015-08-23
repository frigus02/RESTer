'use strict';

angular.module('app')
    .directive('authorizationInput', [function () {

        return {
            restrict: 'E',
            scope: true,
            templateUrl: 'views/directives/authorization-input.html',
            link: function postLink(scope, element, attrs, ngModelCtrl) {
                
            },
            controller: function ($scope) {

            }
        };

    }]);
