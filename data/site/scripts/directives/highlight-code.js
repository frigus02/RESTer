'use strict';

angular.module('app')
    .directive('highlightCode', ['$sce', '$worker', '$error', function ($sce, $worker, $error) {

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
                    wrap: false
                };
                $scope.isHighlighting = false;
                $scope.highlightedLanguage = '';
                $scope.highlightedCode = '';
                $scope.highlightedFormattedCode = '';

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
                }, 100);

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

                $scope.availableLanguages = hljs.listLanguages().sort();
                $scope.changeLanguage = function (newLanguage) {
                    $scope.language = newLanguage;
                };
            }
        };

    }]);
