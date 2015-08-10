'use strict';

angular.module('app')
    .controller('HistoryCtrl', ['$scope', '$state', function ($scope, $state) {
        
        $state.current.data = {
            title: 'History'
        };

    }]);
