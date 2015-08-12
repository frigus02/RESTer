'use strict';

angular.module('app')
    .controller('RequestCtrl', ['$scope', '$state', '$stateParams', '$rester', '$data', '$mdDialog', '$error',
        function ($scope, $state, $stateParams, $rester, $data, $mdDialog, $error) {
        
            $state.current.data = {
                actions: [
                    {
                        title: 'Save request',
                        icon: 'save',
                        action: saveRequest
                    }
                ]
            };

            $scope.$watch('request.id', function () {
                $state.current.data.actions.splice(1, 1);
                if ($scope.request.hasOwnProperty('id')) {
                    $state.current.data.actions.push({
                        title: 'Delete request',
                        icon: 'delete',
                        action: deleteRequest
                    });
                }
            });

            $scope.$watchGroup(['request.collection', 'request.title'], function () {
                var collection = $scope.request.collection || '<no collection>',
                    title = $scope.request.title || '<no title>';

                $state.current.data.title = `${collection} / ${title}`;
            });

            $scope.request = new $data.Request();
            $scope.response = null;
            $scope.requestMethodSearch = '';
            $scope.requestIsSending = false;

            if ($stateParams.id) {
                $data.getRequest($stateParams.id).then(r => {
                    $scope.request = r;
                });
            } else if ($stateParams.request && $stateParams.response) {
                $scope.request = $stateParams.request;
                delete $scope.request.id;
                $scope.response = $stateParams.response;
            }

            $scope.queryRequestMethods = function (query) {
                if (!query) return [];

                var methods = ['DELETE', 'GET', 'HEAD', 'POST', 'PUT'],
                    uppercaseQuery = angular.uppercase(query);

                if (methods.indexOf(uppercaseQuery) === -1) {
                    methods.push(uppercaseQuery);
                    methods.sort();
                }

                return methods.filter(m => m.indexOf(uppercaseQuery) > -1);
            };

            $scope.sendRequest = function () {
                $scope.requestIsSending = true;
                $rester.sendRequest($scope.request)
                    .then(r => {
                        $scope.requestIsSending = false;
                        $scope.response = r;

                        $data.addHistoryEntry(Object.assign(new $data.HistoryEntry(), {
                            time: new Date(),
                            request: $scope.request,
                            response: $scope.response
                        }));
                    })
                    .catch(e => {
                        $scope.requestIsSending = false;
                        $error.show(e);
                    });
            };

            $scope.getResponseBadgeModifierClass = function() {
                if (!$scope.response) return;

                var status = $scope.response.status;
                if (status >= 100 && status < 200) {
                    return 'badge--info';
                } else if (status >= 200 && status < 300) {
                    return 'badge--success';
                } else if (status >= 300 && status < 400) {
                    return 'badge--info';
                } else if (status >= 400) {
                    return 'badge--warn';
                }
            };

            function saveRequest($event) {
                $mdDialog.show({
                    targetEvent: $event,
                    templateUrl: 'views/dialogs/save-request.html',
                    controller: 'DialogSaveRequestCtrl',
                    locals: {
                        isNew: !$scope.request.hasOwnProperty('id'),
                        collection: $scope.request.collection,
                        title: $scope.request.title
                    }
                }).then(input => {
                    $scope.request.collection = input.collection;
                    $scope.request.title = input.title;
                    if (!input.overwrite) {
                        delete $scope.request.id;
                    }

                    $data.putRequest($scope.request).then(() => {
                        $state.go('main.request', {
                            id: $scope.request.id
                        })
                    });
                });
            }

            function deleteRequest($event) {
                $mdDialog.show($mdDialog.confirm()
                    .targetEvent($event)
                    .content('Are you sure you want to delete the request?')
                    .ok('Delete')
                    .cancel('Cancel')
                ).then(() => {
                    $data.deleteRequest($scope.request).then(() => {
                        $state.go('main.request', {
                            id: null
                        });
                    });
                });
            }

        }
    ]);
