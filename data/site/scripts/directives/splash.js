'use strict';

angular.module('app')
    .directive('splash', ['$timeout', function ($timeout) {

        return {
            restrict: 'E',
            scope: {},
            templateUrl: 'views/directives/splash.html',
            link: function ($scope, $element) {
                const element = $element[0];

                $timeout(() => {
                    element.style.opacity = 0;
                    element.addEventListener('transitionend', () => {
                        element.remove();
                    });
                }, 300);
            }
        };

    }]);
