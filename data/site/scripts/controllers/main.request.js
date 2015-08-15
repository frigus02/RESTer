'use strict';

angular.module('app')
    .controller('RequestCtrl', ['$scope', '$state', '$rootScope', '$rester', '$data', '$mdDialog', '$error', '$filter',
        function ($scope, $state, $rootScope, $rester, $data, $mdDialog, $error, $filter) {

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

            $scope.$watchGroup(['request.collection', 'request.title', 'time'], function () {
                var collection = $scope.request.collection || '<no collection>',
                    title = $scope.request.title || '<no title>',
                    time = $scope.time ? $filter('date')($scope.time, 'yyyy-MM-dd HH:mm:ss') : '';

                $state.current.data.title = `${collection} / ${title}`;
                if (time) {
                    $state.current.data.title += ` (${time})`;
                }
            });

            $scope.time = null;
            $scope.request = new $data.Request();
            $scope.response = null;
            $scope.requestMethodSearch = '';
            $scope.requestIsSending = false;

            function updateState(newStateParams) {
                $scope.requestIsSending = false;
                $scope.requestMethodSearch = '';

                if (newStateParams.historyId) {
                    $data.getHistoryEntry(+newStateParams.historyId).then(historyEntry => {
                        if (historyEntry.request.id != newStateParams.id) {
                            $error.show();
                            $state.go('main.request.new');
                        } else {
                            $scope.time = historyEntry.time;
                            $scope.request = historyEntry.request;
                            $scope.response = historyEntry.response;
                        }
                    });
                } else if (newStateParams.id) {
                    $data.getRequest(+newStateParams.id).then(request => {
                        $scope.time = null;
                        $scope.request = request;
                        $scope.response = null;
                    });
                } else {
                    $scope.time = null;
                    $scope.request = new $data.Request();
                    $scope.response = null;
                }
            }

            updateState($state.params);
            $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
                toState.data = fromState.data;
                updateState(toParams);
            });

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
                    .then(response => {
                        $scope.requestIsSending = false;

                        $data.addHistoryEntry(Object.assign(new $data.HistoryEntry(), {
                            time: new Date(),
                            request: $scope.request,
                            response: response
                        })).then(historyId => {
                            $state.go('main.request.history', {
                                id: $scope.request.id,
                                historyId: historyId
                            });
                        });
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
                        title: $scope.request.title,
                        showHistoryWarning: $scope.request.hasOwnProperty('id') && $state.params.historyId
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
                        $state.go('main.request.new');
                    });
                });
            }

        }
    ]);
