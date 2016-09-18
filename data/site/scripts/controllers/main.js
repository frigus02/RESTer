'use strict';

angular.module('app')
    .controller('MainCtrl', ['$scope', '$rootScope', '$mdSidenav', '$state', '$rester', '$hotkeys', '$mdDialog', '$navigation',
        function ($scope, $rootScope, $mdSidenav, $state, $rester, $hotkeys, $mdDialog, $navigation) {

            $scope.settings = $rester.settings;
            $scope.navItems = $navigation.items;


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

            $scope.$watch(
                function () {
                    let title = $scope.getTitle();
                    if (typeof title === 'object') {
                        return title.getAsString();
                    } else {
                        return title;
                    }
                },
                function (newTitle) {
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
