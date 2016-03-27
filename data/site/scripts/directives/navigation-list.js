'use strict';

angular.module('app')

    /**
     * @ngdoc directive
     * @name navigationList
     *
     * @description
     * Renders a navigation with the specified list of items.
     *
     * Each item is an object with the mandatory properties `id` and `type`.
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
     * Optional: `subtitle`, `action` (inner properties: `icon`, `targetState`&`targetStateParams`|`targetAction`)
     *
     * `group`
     * Renders an collapsed but expandable group of items.
     * Requires: `title`, `items` (list of items with type "item")
     *
     * @param {items=} An array of items to show in the navigation.
     * @param {itemClicked&} Callback, which is executed when an item was clicked.
     */

    .directive('navigationList', ['$state', function ($state) {

        return {
            restrict: 'E',
            scope: {
                items: '=',
                itemClicked: '&'
            },
            templateUrl: 'views/directives/navigation-list.html',
            controller: function ($scope) {
                $scope.isItemActive = function (item) {
                    if (item.targetState) {
                        return $state.includes(item.targetState, item.targetStateParams);
                    } else {
                        return false;
                    }
                };

                $scope.invokeItem = function (item) {
                    $scope.itemClicked({item: item});

                    if (item.targetState) {
                        $state.go(item.targetState, item.targetStateParams, item.targetStateOptions);
                    } else if (item.targetAction) {
                        item.targetAction();
                    }
                };

                $scope.isGroupExpanded = function (item) {
                    if (typeof item.expanded !== 'boolean') {
                        item.expanded = item.items.some(i => $scope.isItemActive(i));
                    }

                    return item.expanded;
                };

                $scope.toggleGroup = function (item) {
                    item.expanded = !$scope.isGroupExpanded(item);
                };

                $scope.getGroupSubitemsStyle = function (item) {
                    return {
                        height: $scope.isGroupExpanded(item) ? `${item.items.length * 36}px` : 0
                    };
                };

                $scope.$on('$stateChangeSuccess', () => {
                    $scope.items.forEach(item => {
                        item.expanded = null;
                    });
                });
            }
        };

    }]);
