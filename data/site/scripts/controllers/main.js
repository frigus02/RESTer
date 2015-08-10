'use strict';

angular.module('app')
    .controller('MainCtrl', ['$scope', '$mdSidenav', '$state', function ($scope, $mdSidenav, $state) {

        $scope.navItems = [
            {
                type: 'subheader',
                title: 'Requests'
            },
            {
                type: 'item',
                title: 'New request',
                targetState: 'main.request'
            },
            {
                type: 'group',
                title: 'Google Tasks',
                expanded: false,
                items: [
                    {
                        title: '/list'
                    },
                    {
                        title: '/get/{id}'
                    }
                ]
            },
            {
                type: 'divider'
            },
            {
                type: 'item',
                title: 'History',
                targetState: 'main.history'
            },
            {
                type: 'item',
                title: 'About',
                targetAction: function () {
                    alert('About');
                }
            }
        ];
 
        $scope.toggleSidenav = function (menuId) {
            $mdSidenav(menuId).toggle();
        };

        $scope.getTitle = function () {
            return ($state.current.data && $state.current.data.title) || 'RESTer';
        };

        $scope.getActions = function () {
            return ($state.current.data && $state.current.data.actions) || [];
        };

    }]);
