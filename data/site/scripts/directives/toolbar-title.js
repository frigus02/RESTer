'use strict';

angular.module('app')
    .directive('toolbarTitle', ['$compile', function ($compile) {

        return {
            restrict: 'E',
            scope: {
                title: '='
            },
            link: function ($scope, $element) {
                let childScope;

                $scope.$watch('title', title => {
                    $element.children().remove();
                    if (childScope) {
                        childScope.$destroy();
                    }

                    if (typeof title === 'object') {
                        const template = angular.element(title.template),
                              childScope = $scope.$new(true);

                        Object.assign(childScope, title.locals);

                        $element.append(template);
                        $compile(template)(childScope);
                    } else {
                        $element.append(angular.element('<h1></h1>').text(title));
                    }
                });
            }
        };

    }]);
