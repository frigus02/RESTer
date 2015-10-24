'use strict';

angular.module('app')
    .directive('highlightCode', ['$sce', '$worker', function ($sce, $worker) {

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
                $scope.highlightedCode = '';
                $scope.highlightedFormattedCode = '';

                let lastHighlightCodeWorker;
                let highlightCodeDebounced = _.debounce(function () {
                    lastHighlightCodeWorker = $worker.HighlightCode.run({
                        language: $scope.language,
                        code: $scope.code
                    });
                    lastHighlightCodeWorker.then(result => {
                        $scope.highlightedCode = $sce.trustAsHtml(result.highlightedCode);
                        $scope.highlightedFormattedCode = $sce.trustAsHtml(result.highlightedFormattedCode);
                        $scope.isHighlighting = false;
                    });
                }, 100);

                $scope.$watchGroup(['code', 'language'], function () {
                    $scope.isHighlighting = true;
                    $scope.highlightedCode = '';
                    $scope.highlightedFormattedCode = '';

                    if (lastHighlightCodeWorker) {
                        lastHighlightCodeWorker.cancel();
                    }

                    highlightCodeDebounced();
                });
            }
        };

    }]);
