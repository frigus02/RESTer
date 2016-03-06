'use strict';

angular.module('app')
    .service('$error', ['$mdDialog', function ($mdDialog) {
        let self = this;

        const TITLES = [
            'Ups, something went wrong!',
            'Oh no, this shouldn\'t happen.'
        ];

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
                .title(_.sample(TITLES))
                .textContent(extractMessage(error))
                .ok('OK');

            $mdDialog.show(dialog);
        };

    }]);
