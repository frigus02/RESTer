'use strict';

angular.module('app')
    .directive('highlightCode', ['$sce', function ($sce) {

        var CODE_FORMATTERS = {
            'json': function (code) {
                return JSON.stringify(JSON.parse(code), null, 4);
            }
        };

        return {
            restrict: 'E',
            scope: {
                code: '@',
                forceLanguage: '@',
                format: '@'
            },
            templateUrl: 'views/directives/highlight-code.html',
            controller: function ($scope) {
                $scope.language = '';
                $scope.highlightedCode = '';

                $scope.$watchGroup(['code', 'format'], highlightCode);

                function highlightCode() {
                    // http://highlightjs.readthedocs.org/en/latest/api.html#highlightauto-value-languagesubset
                    if ($scope.forceLanguage) {
                        var result = hljs.highlight($scope.forceLanguage, $scope.code);
                    } else {
                        var result = hljs.highlightAuto($scope.code);
                    }

                    if ($scope.$eval($scope.format) && CODE_FORMATTERS[result.language]) {
                        var formattedCode = CODE_FORMATTERS[result.language]($scope.code);
                        result = hljs.highlightAuto(formattedCode);
                    }

                    $scope.language = result.language;
                    $scope.highlightedCode = $sce.trustAsHtml(result.value);
                }
            }
        };

    }]);
