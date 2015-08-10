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
                format: '@'
            },
            template: `
                <pre>
                    <code class="hljs {{language}}" ng-bind-html="highlightedCode"></code>
                </pre>
            `,
            controller: function ($scope) {
                $scope.language = '';
                $scope.highlightedCode = '';

                $scope.$watchGroup(['code', 'format'], highlightCode);

                function highlightCode() {
                    // http://highlightjs.readthedocs.org/en/latest/api.html#highlightauto-value-languagesubset
                    var result = hljs.highlightAuto($scope.code);

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
