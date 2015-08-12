'use strict';

angular.module('app')
    .directive('navigationList', ['$state', function ($state) {

        return {
            restrict: 'E',
            scope: {
                items: '=',
                itemClicked: '&'
            },
            template: `
                <md-list>
                    <span ng-repeat-start="item in items"></span>

                    <md-subheader ng-if="item.type === 'subheader'"
                        class="md-no-sticky">
                        {{item.title}}
                        <md-button ng-if="item.action" class="md-icon-button"
                            ng-click="invokeItem(item.action)">
                            <md-icon>{{item.action.icon}}</md-icon>
                        </md-button>
                    </md-subheader>

                    <md-list-item ng-if="item.type === 'item'"
                        ng-click="invokeItem(item)"
                        ng-class="{active: isItemActive(item)}">
                        <div class="navigation-list-item__text">{{item.title}}</div>
                    </md-list-item>

                    <div ng-if="item.type === 'group'"
                        class="navigation-list-itemgroup"
                        ng-class="{expanded: isGroupExpanded(item)}">
                        <md-list-item ng-click="toggleGroup(item)">
                            <div class="navigation-list-item__text">{{item.title}}</div>
                            <md-icon class="navigation-list-itemgroup__icon material-icons">expand_more</md-icon>
                        </md-list-item>
                        <div class="navigation-list-itemgroup__subitems" ng-style="getGroupSubitemsStyle(item)">
                            <md-list-item ng-repeat="subitem in item.items"
                                ng-click="invokeItem(subitem)"
                                ng-class="{active: isItemActive(subitem)}">
                                <div class="navigation-list-item__text">{{subitem.title}}</div>
                            </md-list-item>
                        </div>
                    </div>

                    <md-divider ng-if="item.type === 'divider'"></md-divider>

                    <span ng-repeat-end></span>
                </md-list>
            `,
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
                        height: $scope.isGroupExpanded(item) ? `${item.items.length * 38}px` : 0
                    };
                };
            }
        };

    }]);
