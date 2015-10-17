'use strict';

angular.module('app')
    .directive('highlightCode', ['$sce', function ($sce) {

        const CODE_FORMATTERS = {
            'json': function (code) {
                return JSON.stringify(JSON.parse(code), null, 4);
            }
        };

        return {
            restrict: 'E',
            scope: {
                code: '@',
                language: '@',
                showOptions: '@'
            },
            templateUrl: 'views/directives/highlight-code.html',
            controller: function ($scope) {
                $scope.format = true;
                $scope.wrap = false;
                $scope.highlightedCode = '';
                $scope.highlightedFormattedCode = '';

                $scope.$watchGroup(['code', 'language'], highlightCode);

                function highlightCode() {
                    let result;
                    if ($scope.language) {
                        result = hljs.highlight($scope.language, $scope.code);
                    } else {
                        result = hljs.highlightAuto($scope.code);
                        $scope.language = result.language;
                    }

                    $scope.highlightedCode = $sce.trustAsHtml(result.value);

                    if (CODE_FORMATTERS[$scope.language]) {
                        let formattedCode = CODE_FORMATTERS[$scope.language]($scope.code);
                        let formattedResult = hljs.highlight($scope.language, formattedCode);

                        $scope.highlightedFormattedCode = $sce.trustAsHtml(formattedResult.value);
                    }
                }
            }
        };

    }]);
