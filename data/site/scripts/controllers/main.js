'use strict';

angular.module('app')
    .controller('MainCtrl', ['$scope', '$rootScope', '$mdSidenav', '$state', '$data', '$q', '$filter',
        function ($scope, $rootScope, $mdSidenav, $state, $data, $q, $filter) {

            $scope.navItems = [];

            var requestNavItems = [],
                requestNavItemsOffset = 0,
                historyNavItems = [],
                historyNavItemsOffset = 0;

            function createNavigation() {
                $q.all([
                    $data.getRequests(),
                    $data.getHistoryEntries(5)
                ]).then(result => {
                    var [requests, historyEntries] = result;
                    $scope.navItems = [];
                    
                    $scope.navItems.push({
                        type: 'subheader',
                        title: 'Requests',
                        action: {
                            icon: 'add',
                            targetState: 'main.request.new'
                        }
                    });

                    requestNavItemsOffset = 1;
                    requestNavItems = _(requests)
                        .groupBy('collection')
                        .pairs()
                        .sortBy(0)
                        .map(coll => {
                            var collItem = createRequestCollectionNavItem(coll[0]);
                            collItem.items = _(coll[1]).sortBy('title').map(createRequestNavItem).value();
                            return collItem;
                        })
                        .value();

                    $scope.navItems.push.apply($scope.navItems, requestNavItems);

                    $scope.navItems.push({
                        type: 'divider'
                    }, {
                        type: 'subheader',
                        title: 'History',
                        action: {
                            icon: 'history',
                            targetState: 'main.history'
                        }
                    });

                    historyNavItemsOffset = requestNavItemsOffset + requestNavItems.length + 2;
                    historyNavItems = historyEntries.map(createHistoryNavItem);
                    $scope.navItems.push.apply($scope.navItems, historyNavItems);
                    
                });
            }

            function createRequestCollectionNavItem(collection) {
                return {
                    type: 'group',
                    title: collection,
                    expanded: null,
                    items: []
                };
            }

            function createRequestNavItem(request) {
                return {
                    type: 'item',
                    id: request.id,
                    title: request.title,
                    targetState: 'main.request.existing',
                    targetStateParams: {
                        id: request.id
                    }
                };
            }

            function createHistoryNavItem(historyEntry) {
                return {
                    type: 'item',
                    id: historyEntry.id,
                    title: `${$filter('date')(historyEntry.time, 'HH:mm:ss')} ${historyEntry.request.method} ${historyEntry.request.url}`,
                    targetState: 'main.request.existing.history',
                    targetStateParams: {
                        id: historyEntry.request.id,
                        historyId: historyEntry.id
                    }
                };
            }

            function updateNavigation(changes) {
                changes.forEach(change => {
                    if (change.item instanceof $data.Request) {
                        if (change.action === 'add' || change.action === 'put') {
                            var collectionIndex = requestNavItemsOffset + _.sortedIndex(
                                requestNavItems,
                                {title: change.item.collection},
                                item => item.title);
                            if (!$scope.navItems[collectionIndex] || $scope.navItems[collectionIndex].title !== change.item.collection) {
                                var newCollectionItem = createRequestCollectionNavItem(change.item.collection);

                                requestNavItems.splice(collectionIndex - requestNavItemsOffset, 0, newCollectionItem);
                                $scope.navItems.splice(collectionIndex, 0, newCollectionItem);
                                historyNavItemsOffset++;
                            }

                            var collection = $scope.navItems[collectionIndex];
                            var requestIndex = _.sortedIndex(collection.items, change.item, item => item.id);
                            if (!collection.items[requestIndex] || collection.items[requestIndex].id !== change.item.id) {
                                collection.items.splice(requestIndex, 0, createRequestNavItem(change.item));
                            } else if (collection.items[requestIndex] && collection.items[requestIndex].id === change.item.id) {
                                Object.assign(collection.items[requestIndex], change.item);
                            }
                        } else if (change.action === 'delete') {
                            var collectionIndex = requestNavItemsOffset + _.findIndex(
                                requestNavItems,
                                item => item.title === change.item.collection);
                            if (collectionIndex < requestNavItemsOffset) return;

                            var collection = $scope.navItems[collectionIndex],
                                requestIndex = _.findIndex(collection.items, item => item.id === change.item.id);
                            if (requestIndex === -1) return;

                            if (collection.items.length === 1) {
                                requestNavItems.splice(collectionIndex - requestNavItemsOffset, 1);
                                $scope.navItems.splice(collectionIndex, 1);
                                historyNavItemsOffset--;
                            } else {
                                collection.items.splice(requestIndex, 1);
                            }
                        }
                    } else if (change.item instanceof $data.HistoryEntry) {
                        if (change.action === 'add') {
                            var newHistoryItem = createHistoryNavItem(change.item);

                            $scope.navItems.splice(historyNavItemsOffset, 0, newHistoryItem);
                            if (historyNavItems.unshift(newHistoryItem) > 5) {
                                $scope.navItems.splice(historyNavItemsOffset + 5, 1);
                                historyNavItems.pop();
                            }
                        }
                    }
                });
            }

            createNavigation();
            $data.addChangeListener(updateNavigation);

     
            $scope.toggleSidenav = function (menuId) {
                $mdSidenav(menuId).toggle();
            };

            $scope.getTitle = function () {
                return $state.current.data && $state.current.data.title;
            };

            $scope.getActions = function () {
                return ($state.current.data && $state.current.data.actions) || [];
            };

            $scope.$watch('getTitle()', function () {
                $rootScope.title = $scope.getTitle();
            });

        }
    ]);
