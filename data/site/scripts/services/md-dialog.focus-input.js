'use strict';

angular.module('app')
    .decorator('$mdDialog', ['$delegate', function ($delegate) {

        const origShow = $delegate.show;

        $delegate.show = function (config) {
            config.onComplete = function ($scope, element) {
                const firstInput = element.find('input')[0];
                if (firstInput) {
                    firstInput.focus();
                }
            };

            return origShow.call($delegate, config);
        };

        return $delegate;

    }]);
