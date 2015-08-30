'use strict';

angular.module('app')
    .filter('expirationDate', ['$filter', function ($filter) {

        return function (input) {
            if (input) {
                return 'Expires ' + $filter('date')(input, 'yyyy-MM-dd HH:mm:ss');
            } else {
                return 'Never expires';
            }
        };

    }]);
