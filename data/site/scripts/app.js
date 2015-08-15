'use strict';

angular
    .module('app', [
        'ngAnimate',
        'ngAria',
        'ngMaterial',
        'ngMessages',
        'ui.router',
        'ui.codemirror'
    ])
    .config(['$urlRouterProvider', '$stateProvider', '$mdThemingProvider',
        function($urlRouterProvider, $stateProvider, $mdThemingProvider) {
            $urlRouterProvider.otherwise('/');
            $stateProvider
                .state('main', {
                    url: '/',
                    templateUrl: 'views/main.html',
                    controller: 'MainCtrl',
                    abstract: true
                })
                .state('main.request', {
                    url: '',
                    templateUrl: 'views/main.request.html',
                    controller: 'RequestCtrl',
                    abstract: true
                })
                .state('main.request.new', {
                    url: ''
                })
                .state('main.request.existing', {
                    url: 'request/:id',
                    params: {
                        id: undefined
                    }
                })
                .state('main.request.history', {
                    url: 'request/:id/history/:historyId',
                    params: {
                        id: null,
                        historyId: undefined
                    }
                })
                .state('main.history', {
                    url: 'history',
                    templateUrl: 'views/main.history.html',
                    controller: 'HistoryCtrl'
                });

            $mdThemingProvider.theme('default')
                .dark()
                .primaryPalette('cyan')
                .accentPalette('amber');
        }
    ]);
