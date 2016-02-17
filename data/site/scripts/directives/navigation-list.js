'use strict';

angular.module('app')
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
