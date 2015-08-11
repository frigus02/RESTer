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
                    },
                    {
                        title: 'View request history',
                        icon: 'history',
                        action: showRequestHistory
                    }
                ]
            };

            $scope.$watchGroup(['request.collection', 'request.title'], function () {
                var collection = $scope.request.collection || '<no collection>',
                    title = $scope.request.title || '<no title>';

                $state.current.data.title = `${collection} / ${title}`;
            });

            $scope.request = {
                collection: null,
                title: null,
                method: 'GET',
                url: '',
                headers: [],
                body: ''
            };

            if ($stateParams.collection && $stateParams.title) {
                $data.getRequest($stateParams.collection, $stateParams.title).then(r => {
                    $scope.request = r;
                });
            }

            $scope.requestIsSending = false;

            $scope.sendRequest = function () {
                $scope.requestIsSending = true;
                $rester.sendRequest($scope.request)
                    .then(r => {
                        $scope.requestIsSending = false;
                        $scope.response = r;
                    })
                    .catch(e => {
                        $scope.requestIsSending = false;
                        alert(e);
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

            $scope.getFormattedResponseHeaders = function () {
                if ($scope.response) {
                    return _($scope.response.headers)
                        .pairs()
                        .sortBy(0)
                        .map(h => `${h[0]}: ${h[1]}`)
                        .value()
                        .join('\r\n');
                }
            };

            function saveRequest($event) {
                if ($scope.request.collection && $scope.request.title) {
                    $data.putRequest($scope.request);
                } else {
                    $mdDialog.show({
                        targetEvent: $event,
                        templateUrl: 'views/dialogs/save-request.html',
                        controller: 'DialogSaveRequestCtrl'
                    }).then(input => {
                        $scope.request.collection = input.collection;
                        $scope.request.title = input.title;

                        $data.putRequest($scope.request).then(() => {
                            $state.go('main.request', {
                                collection: $scope.request.collection,
                                title: $scope.request.title
                            })
                        });
                    });
                }
            }

            function showRequestHistory() {
                
            }

        }
    ]);
