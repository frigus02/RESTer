'use strict';

angular.module('app')
    .controller('DialogHighlightCodeChangeLanguageCtrl', ['$scope', '$mdDialog',
        function ($scope, $mdDialog) {

            const AVAILABLE_LANGUAGES = hljs.listLanguages().sort();

            $scope.searchText = '';

            $scope.queryLanguages = function (search) {
                search = angular.lowercase(search);
                return AVAILABLE_LANGUAGES.filter(lang => lang.indexOf(search) > -1);
            };

            $scope.selectLanguage = function (lang) {
                $mdDialog.hide(lang);
            };

        }
    ]);
