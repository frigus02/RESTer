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
                        <md-button class="md-icon-button"
                            ng-repeat="subitem in item.items"
                            ng-click="invokeItem(subitem)">
                            <md-icon>{{subitem.icon}}</md-icon>
                        </md-button>
                    </md-subheader>

                    <md-list-item ng-if="item.type === 'item'"
                        ng-click="invokeItem(item)">
                        {{item.title}}
                    </md-list-item>

                    <div ng-if="item.type === 'group'"
                        class="navigation-list-itemgroup"
                        ng-class="{expanded: item.expanded}">
                        <md-list-item ng-click="toggleGroup(item)">
                            <span flex>{{item.title}}</span>
                            <md-icon class="navigation-list-itemgroup__icon material-icons">expand_more</md-icon>
                        </md-list-item>
                        <div class="navigation-list-itemgroup__subitems" ng-style="getGroupSubitemsStyle(item)">
                            <md-list-item ng-repeat="subitem in item.items"
                                ng-click="invokeItem(subitem)">
                                {{subitem.title}}
                            </md-list-item>
                        </div>
                    </div>

                    <md-divider ng-if="item.type === 'divider'"></md-divider>

                    <span ng-repeat-end></span>
                </md-list>
            `,
            controller: function ($scope) {
                $scope.invokeItem = function (item) {
                    $scope.itemClicked({item: item});
                    
                    if (item.targetState) {
                        $state.go(item.targetState, item.targetStateParams);
                    } else if (item.targetAction) {
                        item.targetAction();
                    }
                };

                $scope.toggleGroup = function (item) {
                    item.expanded = !item.expanded;
                };

                $scope.getGroupSubitemsStyle = function (item) {
                    return {
                        height: item.expanded ? `${item.items.length * 38}px` : 0
                    };
                };
            }
        };

    }]);
