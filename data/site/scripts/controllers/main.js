'use strict';

angular.module('app')
    .controller('MainCtrl', ['$scope', '$mdSidenav', '$state', '$data',
        function ($scope, $mdSidenav, $state, $data) {

            $scope.navItems = [];

            function buildNavigation() {
                $data.getRequests().then(requests => {
                    $scope.navItems = [];
                    
                    $scope.navItems.push({
                        type: 'subheader',
                        title: 'Requests',
                        items: [
                            {
                                icon: 'add',
                                targetState: 'main.request',
                                targetStateParams: {
                                    collection: null,
                                    title: null
                                }
                            }
                        ]
                    });

                    var requestNavItems = _(requests)
                        .groupBy('collection')
                        .pairs()
                        .sortBy(0)
                        .map(coll => {
                            return {
                                type: 'group',
                                title: coll[0],
                                expanded: false,
                                items: _(coll[1]).sortBy('title').map(req => {
                                    return {
                                        title: req.title,
                                        targetState: 'main.request',
                                        targetStateParams: {
                                            collection: req.collection,
                                            title: req.title
                                        }
                                    };
                                }).value()
                            };
                        })
                        .value();

                    $scope.navItems.push.apply($scope.navItems, requestNavItems);

                    $scope.navItems.push({
                        type: 'divider'
                    }, {
                        type: 'item',
                        title: 'History',
                        targetState: 'main.history'
                    }, {
                        type: 'item',
                        title: 'About',
                        targetAction: function () {
                            alert('About');
                        }
                    });
                });
            }

            buildNavigation();
            $data.addChangeListener(buildNavigation);

     
            $scope.toggleSidenav = function (menuId) {
                $mdSidenav(menuId).toggle();
            };

            $scope.getTitle = function () {
                return ($state.current.data && $state.current.data.title) || 'RESTer';
            };

            $scope.getActions = function () {
                return ($state.current.data && $state.current.data.actions) || [];
            };

        }
    ]);
