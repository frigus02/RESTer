'use strict';

angular.module('app')
    .controller('MainCtrl', ['$scope', '$rootScope', '$mdSidenav', '$state', '$rester', '$settings', '$q', '$filter', '$hotkeys', '$mdDialog', '$variables',
        function ($scope, $rootScope, $mdSidenav, $state, $rester, $settings, $q, $filter, $hotkeys, $mdDialog, $variables) {

            $scope.settings = $settings;
            $scope.navItems = [];

            let requestNavItems = [],
                requestNavItemsOffset = 0,
                historyNavItems = [],
                historyNavItemsOffset = 0;

            const requestFields = ['id', 'collection', 'title'],
                  historyFields = ['id', 'time', 'request.id', 'request.collection', 'request.title', 'request.method', 'request.url', 'request.variables'],
                  environmentFields = ['id', 'name'];

            function createNavigation() {
                $q.all([
                    $rester.getRequests(requestFields),
                    $rester.getHistoryEntries(-5, historyFields),
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
                    requests = requests.map(r => {
                        r = angular.copy(r);
                        r.collection = r.collection.split(/\s*\/\s*/i);
                        return r;
                    });
                    requestNavItems = createListOfRequestNavItems(requests);

                    $scope.navItems.push(...requestNavItems);

                    $scope.navItems.push(
                        {
                            id: 'divider:settings',
                            type: 'divider'
                        },
                        {
                            id: 'settings',
                            type: 'subheader',
                            title: 'Settings',
                            action: {
                                icon: 'settings',
                                targetState: 'main.settings'
                            }
                        },
                        {
                            id: 'environments',
                            type: 'item',
                            title: 'Environment',
                            subtitle: activeEnvironment && activeEnvironment.name,
                            targetState: 'main.environments'
                        },
                        {
                            id: 'divider:history',
                            type: 'divider'
                        },
                        {
                            id: 'history',
                            type: 'subheader',
                            title: 'History',
                            action: {
                                icon: 'history',
                                targetState: 'main.history'
                            }
                        }
                    );

                    historyNavItemsOffset = requestNavItemsOffset + requestNavItems.length + 5;
                    historyNavItems = historyEntries.map(createHistoryNavItem);
                    $scope.navItems.push(...historyNavItems);
                });
            }

            function createListOfRequestNavItems(rawRequests) {
                return _(rawRequests)
                    .groupBy(request => request.collection[0])
                    .toPairs()
                    .sortBy(0)
                    .map(coll => {
                        coll[1].forEach(request => request.collection.splice(0, 1));

                        let collItem = createRequestCollectionNavItem(coll[0]);
                        let subrequests = coll[1].filter(request => request.collection.length === 0).map(createRequestNavItem);
                        let subcollections = createListOfRequestNavItems(coll[1].filter(request => request.collection.length > 0));
                        collItem.items = _.sortBy(subcollections.concat(subrequests), 'title');

                        return collItem;
                    })
                    .value();
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

            function removeRequestNavigationItem(requestId, requests = requestNavItems) {
                for (let requestIndex = 0; requestIndex < requests.length; requestIndex++) {
                    let request = requests[requestIndex];
                    if (request.type === 'item' && request.id === 'request:' + requestId) {
                        requests.splice(requestIndex, 1);
                        return true;
                    }

                    if (request.type === 'group' && removeRequestNavigationItem(requestId, request.items)) {
                        if (request.items.length === 0) {
                            requests.splice(requestIndex, 1);
                            if (requests === requestNavItems) {
                                $scope.navItems.splice(requestIndex + requestNavItemsOffset, 1);
                            }
                        }

                        return true;
                    }
                }

                return false;
            }

            function updateNavigationBasedOnDataChanges(changes) {
                changes.forEach(change => {
                    if (change.itemType === 'Request') {
                        if (change.action === 'put' || change.action === 'delete') {
                            removeRequestNavigationItem(change.item.id);
                        }

                        if (change.action === 'add' || change.action === 'put') {
                            let collectionParts = change.item.collection.split(/\s*\/\s*/i),
                                collectionItems = requestNavItems;

                            while (collectionParts.length > 0) {
                                let collection = collectionItems.find(item => item.title === collectionParts[0]);
                                if (!collection) {
                                    collection = createRequestCollectionNavItem(collectionParts[0]);

                                    let insertAtIndex = _.sortedIndexBy(collectionItems, {title: collectionParts[0]}, item => item.title);
                                    collectionItems.splice(insertAtIndex, 0, collection);
                                    if (collectionItems === requestNavItems) {
                                        $scope.navItems.splice(insertAtIndex + requestNavItemsOffset, 0, collection);
                                    }
                                }

                                collectionItems = collection.items;
                                collectionParts.splice(0, 1);
                            }

                            let insertAtIndex = _.sortedIndexBy(collectionItems, change.item, item => item.title);
                            collectionItems.splice(insertAtIndex, 0, createRequestNavItem(change.item));
                        }

                        historyNavItemsOffset = requestNavItemsOffset + requestNavItems.length + 5;
                    } else if (change.itemType === 'HistoryEntry') {
                        if (change.action === 'add') {
                            let newHistoryItem = createHistoryNavItem(change.item);

                            $scope.navItems.splice(historyNavItemsOffset, 0, newHistoryItem);
                            if (historyNavItems.unshift(newHistoryItem) > 5) {
                                $scope.navItems.splice(historyNavItemsOffset + 5, 1);
                                historyNavItems.pop();
                            }
                        }
                    } else if (change.itemType === 'Environment') {
                        if (change.item.id === $settings.activeEnvironment) {
                            updateEnvironmentNavItemSubtitle(change.item);
                        }
                    }
                });
            }

            function updateNavigationBasedOnSettingsChanges() {
                getActiveEnvironment().then(updateEnvironmentNavItemSubtitle);
            }

            function getActiveEnvironment() {
                let envId = $settings.activeEnvironment;
                if (envId) {
                    return $rester.getEnvironment(envId, environmentFields);
                } else {
                    return $q.resolve();
                }
            }

            function updateEnvironmentNavItemSubtitle(env) {
                let envItem = $scope.navItems.find(item => item.id === 'environments');
                envItem.subtitle = env && env.name;
            }

            createNavigation();
            $rester.addEventListener('dataChange', updateNavigationBasedOnDataChanges);
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

            $hotkeys.add(new $hotkeys.Hotkey({
                combos: ['mod+e'],
                description: 'Cycle through environments.',
                callback () {
                    $rester.getEnvironments().then(envs => {
                        if (envs.length === 0) return;

                        const index = envs.findIndex(env => env.id === $scope.settings.activeEnvironment),
                              newIndex = (index + 1) % envs.length,
                              newEnv = envs[newIndex];

                        $scope.settings.activeEnvironment = newEnv.id;
                    });
                }
            }), $scope);

        }
    ]);
