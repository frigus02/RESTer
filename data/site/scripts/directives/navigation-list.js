'use strict';

angular.module('app')

    /**
     * @ngdoc directive
     * @name navigationList
     *
     * @description
     * Container directive for multiple navigationListItem elements.
     */
    .directive('navigationList', function () {
        return {
            restrict: 'E',
            transclude: true,
            templateUrl: 'views/directives/navigation-list.html',
        };
    });
