'use strict';

angular.module('app')
    .service('$error', ['$mdToast', function ($mdToast) {
        let self = this;

        self.show = function (message) {
            let toast = $mdToast.simple()
                .content(message)
                .hideDelay(15000)
                .action('OK');

            $mdToast.show(toast);
        };

    }]);
