'use strict';

angular.module('app')
    .directive('highlightCode', ['$sce', '$worker', '$error', '$mdDialog', function ($sce, $worker, $error, $mdDialog) {

        return {
            restrict: 'E',
            scope: {
                code: '@',
                language: '@',
                showOptions: '@'
            },
            templateUrl: 'views/directives/highlight-code.html',
            controller: function ($scope) {
                $scope.settings = {
                    format: true,
                    wrap: true,
                    preview: false
                };
                $scope.isHighlighting = false;
                $scope.highlightedLanguage = '';
                $scope.highlightedCode = '';
                $scope.highlightedFormattedCode = '';
                $scope.isPreviewSupported = false;

                let lastHighlightCodeWorker;
                let highlightCodeDebounced = _.debounce(() => {
                    lastHighlightCodeWorker = $worker.HighlightCode.run({
                        language: $scope.language,
                        code: $scope.code
                    });
                    lastHighlightCodeWorker.then(result => {
                        $scope.highlightedLanguage = result.language;
                        $scope.highlightedCode = $sce.trustAsHtml(result.highlightedCode);
                        $scope.highlightedFormattedCode = $sce.trustAsHtml(result.highlightedFormattedCode);
                        $scope.isHighlighting = false;
                    });
                    lastHighlightCodeWorker.catch(error => {
                        $error.show(error);
                        $scope.isHighlighting = false;
                    });
                }, 300);

                $scope.$watchGroup(['code', 'language'], () => {
                    $scope.isHighlighting = true;
                    $scope.highlightedLanguage = '';
                    $scope.highlightedCode = '';
                    $scope.highlightedFormattedCode = '';

                    if (lastHighlightCodeWorker) {
                        lastHighlightCodeWorker.cancel();
                    }

                    highlightCodeDebounced();
                });

                $scope.$watch('highlightedLanguage', () => {
                    $scope.isPreviewSupported = $scope.highlightedLanguage === 'html';
                });

                $scope.changeLanguage = function () {
                    $mdDialog.show({
                        templateUrl: 'views/dialogs/highlight-code-change-language.html',
                        controller: 'DialogHighlightCodeChangeLanguageCtrl',
                        clickOutsideToClose: true,
                        escapeToClose: true
                    }).then(newLanguage => {
                        $scope.language = newLanguage;
                    });
                };
            }
        };

    }]);
