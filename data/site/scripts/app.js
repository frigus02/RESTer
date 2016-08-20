'use strict';

angular
    .module('app', [
        'ngAnimate',
        'ngAria',
        'ngMaterial',
        'ngMessages',
        'ngSanitize',
        'ui.router',
        'ui.codemirror'
    ])
    .config(['$urlRouterProvider', '$stateProvider', '$mdThemingProvider',
        function ($urlRouterProvider, $stateProvider, $mdThemingProvider) {
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
                .state('main.settings', {
                    url: 'settings',
                    templateUrl: 'views/main.settings.html',
                    controller: 'SettingsCtrl'
                })
                .state('main.environments', {
                    url: 'environments',
                    templateUrl: 'views/main.environments.html',
                    controller: 'EnvironmentsCtrl'
                })
                .state('main.history', {
                    url: 'history',
                    templateUrl: 'views/main.history.html',
                    controller: 'HistoryCtrl'
                })
                .state('main.about', {
                    url: 'about',
                    templateUrl: 'views/main.about.html',
                    controller: 'AboutCtrl'
                });

            $mdThemingProvider.theme('default')
                .dark()
                .primaryPalette('cyan')
                .accentPalette('amber');
        }
    ])
    .run([
        '$authorization', '$authorizationProviderCustom', '$authorizationProviderBasic', '$authorizationProviderOAuth2',
        '$variables', '$variablesProviderEnv',
        function ($authorization, $authorizationProviderCustom, $authorizationProviderBasic, $authorizationProviderOAuth2,
                  $variables, $variablesProviderEnv) {
            $authorization.$$providers.push(
                $authorizationProviderCustom,
                $authorizationProviderBasic,
                $authorizationProviderOAuth2);

            $variables.$$providers.push(
                $variablesProviderEnv);
        }
    ]);
