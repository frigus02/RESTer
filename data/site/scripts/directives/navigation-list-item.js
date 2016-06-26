'use strict';

angular.module('app')

    /**
     * @ngdoc directive
     * @name navigationListItem
     *
     * @description
     * Renders a navigation list item.
     *
     * The `item` is an object with the mandatory properties `id` and `type`.
     * Based on the type other properties are required.
     *
     * `divider`
     * Renders a divider line.
     *
     * `subheader`
     * Renders a header for navgation items.
     * Requires: `title`
     * Optional: `action` (inner properties: `icon`, `targetState`&`targetStateParams`|`targetAction`)
     *
     * `item`
     * Renders a normal navigation item.
     * Requires: `title`, `targetState`&`targetStateParams`|`targetAction`
     * Optional: `subtitle`
     *
     * `group`
     * Renders an collapsed but expandable group of items.
     * Requires: `title`, `items` (list of items with type "item")
     *
     * @param {item=} The item properties.
     * @param {itemClicked&} Callback, which is executed when the item was clicked.
     */
    .directive('navigationListItem', function () {
        return {
            restrict: 'E',
            scope: {
                item: '=',
                itemClicked: '&',
                indentLevel: '<?'
            },
            templateUrl: 'views/directives/navigation-list-item.html',
            link: function ($scope, $element) {
                const element = $element[0];


                function getGroupHeight(item) {
                    if (item.type === 'group' && $scope.isGroupExpanded(item)) {
                        return _.sumBy(item.items, item => 36 + getGroupHeight(item));
                    } else {
                        return 0;
                    }
                }

                $scope.$watch(() => getGroupHeight($scope.item), height => {
                    const subitems = element.querySelector('.navigation-list-itemgroup__subitems');
                    if (!subitems) return;

                    subitems.style.height = `${height}px`;
                    if (height === 0) {
                        subitems.style.transform = `scaleY(0)`;
                        subitems.style.opacity = 0;
                    } else {
                        subitems.style.removeProperty('transform');
                        subitems.style.removeProperty('opacity');
                    }
                });
            },
            controller: ['$scope', '$state', function ($scope, $state) {
                if (!$scope.indentLevel) {
                    $scope.indentLevel = 0;
                }

                $scope.isActive = function (item) {
                    if (item.targetState) {
                        return $state.includes(item.targetState, item.targetStateParams);
                    } else {
                        return false;
                    }
                };

                $scope.invoke = function (action) {
                    $scope.itemClicked({item: $scope.item});

                    if (action.targetState) {
                        $state.go(action.targetState, action.targetStateParams, action.targetStateOptions);
                    } else if (action.targetAction) {
                        action.targetAction();
                    }
                };

                $scope.isGroupExpanded = function (item) {
                    if (typeof item.expanded !== 'boolean') {
                        item.expanded = item.items.some(i => {
                            if (i.type === 'group') {
                                return $scope.isGroupExpanded(i);
                            } else {
                                return $scope.isActive(i);
                            }
                        });
                    }

                    return item.expanded;
                };

                $scope.toggleGroup = function (item) {
                    item.expanded = !$scope.isGroupExpanded(item);
                };

                $scope.$on('$stateChangeSuccess', () => {
                    $scope.item.expanded = null;
                });
            }]
        };
    });
