'use strict';

angular.module('app')
    .controller('MainCtrl', ['$scope', '$rootScope', '$mdSidenav', '$state', '$data', '$settings', '$q', '$filter', '$hotkeys', '$mdDialog', '$variables',
        function ($scope, $rootScope, $mdSidenav, $state, $data, $settings, $q, $filter, $hotkeys, $mdDialog, $variables) {

            $scope.navItems = [];

            let requestNavItems = [],
                requestNavItemsOffset = 0,
                historyNavItems = [],
                historyNavItemsOffset = 0;

            function createNavigation() {
                $q.all([
                    $data.getRequests(),
                    $data.getHistoryEntries(-5),
                    getActiveEnvironment()
                ]).then(([requests, historyEntries, activeEnvironment]) => {
                    $scope.navItems = [];

                    $scope.navItems.push({
                        id: 'requests',
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
                        .toPairs()
                        .sortBy(0)
                        .map(coll => {
                            let collItem = createRequestCollectionNavItem(coll[0]);
                            collItem.items = _(coll[1]).sortBy('title').map(createRequestNavItem).value();
                            return collItem;
                        })
                        .value();

                    $scope.navItems.push(...requestNavItems);

                    $scope.navItems.push({
                        id: 'divider:settings',
                        type: 'divider'
                    }, {
                        id: 'settings',
                        type: 'subheader',
                        title: 'Settings',
                        action: {
                            icon: 'settings',
                            targetState: 'main.settings'
                        }
                    }, {
                        id: 'environments',
                        type: 'item',
                        title: 'Environment',
                        subtitle: activeEnvironment && activeEnvironment.name,
                        targetState: 'main.environments'
                    }, {
                        id: 'divider:history',
                        type: 'divider'
                    }, {
                        id: 'history',
                        type: 'subheader',
                        title: 'History',
                        action: {
                            icon: 'history',
                            targetState: 'main.history'
                        }
                    });

                    historyNavItemsOffset = requestNavItemsOffset + requestNavItems.length + 5;
                    historyNavItems = historyEntries.map(createHistoryNavItem);
                    $scope.navItems.push(...historyNavItems);
                });
            }

            function createRequestCollectionNavItem(collection) {
                return {
                    id: 'requestcollection:' + collection,
                    type: 'group',
                    title: collection,
                    items: []
                };
            }

            function createRequestNavItem(request) {
                return {
                    id: 'request:' + request.id,
                    type: 'item',
                    title: request.title,
                    targetState: 'main.request.existing',
                    targetStateParams: {
                        id: request.id
                    }
                };
            }

            function createHistoryNavItem(historyEntry) {
                let requestTitle = '';
                if (historyEntry.request.id) {
                    requestTitle = `${historyEntry.request.collection} / ${historyEntry.request.title}`;
                }

                let compiledRequest = historyEntry.request;
                if (historyEntry.request.variables.enabled) {
                    compiledRequest = $variables.replace(historyEntry.request, historyEntry.request.variables.values);
                }

                return {
                    id: 'historyentry:' + historyEntry.id,
                    type: 'item',
                    title: `${$filter('date')(historyEntry.time, 'HH:mm:ss')} ${requestTitle}`,
                    subtitle: `${compiledRequest.method} ${compiledRequest.url}`,
                    targetState: 'main.request.existing.history',
                    targetStateParams: {
                        id: historyEntry.request.id,
                        historyId: historyEntry.id
                    }
                };
            }

            function updateNavigationBasedOnDataChanges(changes) {
                changes.forEach(change => {
                    if (change.item instanceof $data.Request) {
                        if (change.action === 'put' || change.action === 'delete') {
                            removeRequestNavigationItem(change.item.id);
                        }

                        if (change.action === 'add' || change.action === 'put') {
                            let collectionIndex = requestNavItems.findIndex(item => item.title === change.item.collection);
                            if (collectionIndex === -1) {
                                let insertAtIndex = requestNavItemsOffset + _.sortedIndexBy(requestNavItems, {title: change.item.collection}, item => item.title),
                                    newCollectionItem = createRequestCollectionNavItem(change.item.collection);

                                requestNavItems.splice(insertAtIndex - requestNavItemsOffset, 0, newCollectionItem);
                                $scope.navItems.splice(insertAtIndex, 0, newCollectionItem);
                                historyNavItemsOffset++;

                                collectionIndex = insertAtIndex;
                            } else {
                                collectionIndex += requestNavItemsOffset;
                            }

                            let collection = $scope.navItems[collectionIndex],
                                insertAtIndex = _.sortedIndexBy(collection.items, change.item, item => item.title);

                            collection.items.splice(insertAtIndex, 0, createRequestNavItem(change.item));
                        }
                    } else if (change.item instanceof $data.HistoryEntry) {
                        if (change.action === 'add') {
                            let newHistoryItem = createHistoryNavItem(change.item);

                            $scope.navItems.splice(historyNavItemsOffset, 0, newHistoryItem);
                            if (historyNavItems.unshift(newHistoryItem) > 5) {
                                $scope.navItems.splice(historyNavItemsOffset + 5, 1);
                                historyNavItems.pop();
                            }
                        }
                    } else if (change.item instanceof $data.Environment) {
                        if (change.item.id === $settings.activeEnvironment) {
                            updateEnvironmentNavItemSubtitle(change.item);
                        }
                    }
                });
            }

            function updateNavigationBasedOnSettingsChanges() {
                getActiveEnvironment().then(updateEnvironmentNavItemSubtitle);
            }

            function removeRequestNavigationItem(requestId) {
                for (let collectionIndex = 0; collectionIndex < requestNavItems.length; collectionIndex++) {
                    let collection = requestNavItems[collectionIndex],
                        requestIndex = collection.items.findIndex(r => r.id === 'request:' + requestId);
                    if (requestIndex > -1) {
                        if (collection.items.length === 1) {
                            requestNavItems.splice(collectionIndex, 1);
                            $scope.navItems.splice(collectionIndex + requestNavItemsOffset, 1);
                            historyNavItemsOffset--;
                        } else {
                            collection.items.splice(requestIndex, 1);
                        }

                        break;
                    }
                }
            }

            function getActiveEnvironment() {
                let envId = $settings.activeEnvironment;
                if (envId) {
                    return $data.getEnvironment(envId);
                } else {
                    return $q.resolve();
                }
            }

            function updateEnvironmentNavItemSubtitle(env) {
                let envItem = $scope.navItems.find(item => item.id === 'environments');
                envItem.subtitle = env && env.name;
            }

            createNavigation();
            $data.addChangeListener(updateNavigationBasedOnDataChanges);
            $settings.addChangeListener(updateNavigationBasedOnSettingsChanges);


            $scope.toggleSidenav = function (menuId) {
                $mdSidenav(menuId).toggle();
            };

            $scope.getTitle = function () {
                return $state.current.data && $state.current.data.title;
            };

            $scope.getActions = function () {
                return $state.current.data && $state.current.data.actions || [];
            };

            $scope.showShortcuts = function ($event) {
                $event.preventDefault();
                $hotkeys.showCheatSheet($event);
            };

            $scope.$watch('getTitle()', function (newTitle) {
                $rootScope.title = newTitle;
            });

            $hotkeys.add(new $hotkeys.Hotkey({
                combos: ['mod+m'],
                description: 'New request.',
                callback () {
                    $state.go('main.request.new');
                }
            }), $scope);

            $hotkeys.add(new $hotkeys.Hotkey({
                combos: ['mod+o', 'mod+p'],
                description: 'Open request.',
                callback () {
                    $mdDialog.show({
                        templateUrl: 'views/dialogs/quick-open.html',
                        controller: 'DialogQuickOpenCtrl',
                        clickOutsideToClose: true,
                        escapeToClose: true
                    });
                }
            }), $scope);

        }
    ]);
