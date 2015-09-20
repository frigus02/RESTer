'use strict';

angular
    .module('app', [
        'ngAnimate',
        'ngAria',
        'ngMaterial',
        'ngMessages',
        'ui.router',
        'ui.codemirror',
        'angular-jwt',
        'cfp.hotkeys'
    ])
    .config(['$urlRouterProvider', '$stateProvider', '$mdThemingProvider', 'hotkeysProvider',
        function ($urlRouterProvider, $stateProvider, $mdThemingProvider, hotkeysProvider) {
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
                        id: null
                    }
                })
                .state('main.request.existing.history', {
                    url: '/history/:historyId',
                    params: {
                        historyId: null
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

            // We provide a custom cheat sheet in the correct design.
            hotkeysProvider.includeCheatSheet = false;
        }
    ])
    .run(['$authorization', '$authorizationProviderCustom', '$authorizationProviderBasic', '$authorizationProviderOAuth2',
        function ($authorization, $authorizationProviderCustom, $authorizationProviderBasic, $authorizationProviderOAuth2) {
            $authorization.$$providers.push(
                $authorizationProviderCustom,
                $authorizationProviderBasic,
                $authorizationProviderOAuth2
            );
        }
    ]);
