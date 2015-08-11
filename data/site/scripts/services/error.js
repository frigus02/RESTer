'use strict';

angular.module('app')
    .service('$error', ['$mdToast', function ($mdToast) {
        var self = this;

        self.show = function (message) {
            var toast = $mdToast.simple()
                .content(message)
                .hideDelay(10000)
                .action('OK');

            $mdToast.show(toast);
        };

    }]);
