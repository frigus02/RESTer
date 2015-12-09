'use strict';

angular.module('app')
    .service('$error', ['$mdToast', function ($mdToast) {
        let self = this;

        function extractMessage(error) {
            if (typeof error === 'string') {
                return error;
            } else if (error.message) {
                return error.message;
            } else {
                try {
                    return JSON.stringify(error);
                } catch (e) {
                    return 'Unknown error.';
                }
            }
        }

        self.show = function (error) {
            let toast = $mdToast.simple()
                .textContent(extractMessage(error))
                .hideDelay(15000)
                .action('OK');

            $mdToast.show(toast);
        };

    }]);
