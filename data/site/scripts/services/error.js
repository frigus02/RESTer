'use strict';

angular.module('app')
    .service('$error', ['$mdDialog', function ($mdDialog) {
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
            let dialog = $mdDialog.alert()
                .title('Ups, something went wrong!')
                .textContent(extractMessage(error))
                .ok('OK');

            $mdDialog.show(dialog);
        };

    }]);
