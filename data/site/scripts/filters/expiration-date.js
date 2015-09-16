'use strict';

angular.module('app')
    .filter('expirationDate', ['$filter', function ($filter) {

        return function (input) {
            if (input) {
            	if (new Date(input) < new Date()) {
    				return 'Expired';
            	} else {
					return 'Expires ' + $filter('date')(input, 'yyyy-MM-dd HH:mm:ss');
            	}
            } else {
                return 'Never expires';
            }
        };

    }]);
