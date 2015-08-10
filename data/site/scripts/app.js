'use strict';

angular
    .module('app', [
        'ui.router'
    ])
    .config(['$urlRouterProvider', '$stateProvider',
        function($urlRouterProvider, $stateProvider) {
            $urlRouterProvider.otherwise('/');
            $stateProvider.state('main', {
                url: '/',
                templateUrl: 'views/main.html',
                controller: 'MainCtrl'
            });
        }
    ]);
