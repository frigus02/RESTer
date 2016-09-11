'use strict';

angular.module('app')
    .controller('RequestCtrl', ['$scope', '$state', '$rootScope', '$rester', '$mdDialog', '$error', '$filter', '$hotkeys', '$variables', '$lintInspections',
        function ($scope, $state, $rootScope, $rester, $mdDialog, $error, $filter, $hotkeys, $variables, $lintInspections) {

            $state.current.data = {
                title: {
                    template: `
                        <request-title-input
                            collection="data.request.collection"
                            title="data.request.title">
                        </request-title-input>`,
                    locals: {
                        data: {
                            get request () {
                                return $scope.request;
                            }
                        }
                    },
                    getAsString () {
                        let collection = $scope.request.collection || '<no collection>',
                            title = $scope.request.title || '<no title>',
                            time = $scope.time ? $filter('date')($scope.time, 'yyyy-MM-dd HH:mm:ss') : '';

                        let pageTitle = `${collection} / ${title}`;
                        if (time) {
                            pageTitle += ` (${time})`;
                        }

                        return pageTitle;
                    }
                },
                actions: [
                    {
                        title: 'Save request',
                        icon: 'save',
                        action: saveRequest,
                        options: [
                            {
                                title: 'Save',
                                action: () => saveRequest()
                            },
                            {
                                title: 'Save as new',
                                action: () => saveRequest(true)
                            }
                        ],
                        isDisabled () {
                            return !($scope.request.collection && $scope.request.title);
                        }
                    }
                ]
            };

            $scope.$watch('request.id', function () {
                $state.current.data.actions.splice(1, 1);
                if ($scope.request.hasOwnProperty('id')) {
                    $state.current.data.actions.push({
                        title: 'Delete request',
                        icon: 'delete',
                        options: [
                            {
                                title: 'Delete',
                                action: deleteRequest
                            }
                        ]
                    });
                }
            });

            $scope.time = null;
            $scope.elapsedMillis = null;
            $scope.request = {
                headers: [],
                variables: {enabled: false}
            };
            $scope.requestVariableValues = {};
            $scope.response = null;
            $scope.requestIsSending = false;
            $scope.selectedTab = 0;
            $scope.experimentalResponseHighlighting = false;

            function updateState(newStateParams) {
                $scope.requestIsSending = false;

                if (newStateParams.historyId) {
                    $rester.getHistoryEntry(+newStateParams.historyId).then(historyEntry => {
                        if (historyEntry.request.id !== +newStateParams.id &&
                            !(historyEntry.request.id === undefined && newStateParams.id === null)) {
                            $error.show(`Specified request id (${newStateParams.id}) does not match the request id of the history entry (${historyEntry.request.id}).`);
                            $state.go('main.request.new');
                        } else {
                            $scope.time = historyEntry.time;
                            $scope.elapsedMillis = new Date(historyEntry.timeEnd) - new Date(historyEntry.time);
                            $scope.request = historyEntry.request;
                            $scope.response = historyEntry.response;

                            $scope.requestVariableValues = _.get($scope.request, 'variables.values', {});
                            _.unset($scope.request, 'variables.values');
                        }
                    });
                } else if (newStateParams.id) {
                    $rester.getRequest(+newStateParams.id).then(request => {
                        $scope.time = null;
                        $scope.elapsedMillis = null;
                        $scope.request = request;
                        $scope.requestVariableValues = {};
                        $scope.response = null;
                    });
                } else {
                    $scope.time = null;
                    $scope.elapsedMillis = null;
                    $scope.request = {
                        headers: [],
                        variables: {enabled: false}
                    };
                    $scope.requestVariableValues = {};
                    $scope.response = null;
                }
            }

            updateState($state.params);
            $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState) {
                if (toState.name.startsWith('main.request')) {
                    toState.data = fromState.data;
                    updateState(toParams);
                }
            });

            $scope.queryRequestMethods = function (query) {
                let methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'PATCH', 'POST', 'PUT'],
                    uppercaseQuery = angular.uppercase(query);

                if (!query) return methods;

                if (methods.indexOf(uppercaseQuery) === -1) {
                    methods.push(uppercaseQuery);
                    methods.sort();
                }

                return methods.filter(m => m.indexOf(uppercaseQuery) > -1);
            };

            $scope.sendRequest = function () {
                if (!$scope.requestForm.$valid) return;

                let compiledRequest = $scope.request,
                    usedVariableValues = {};

                if ($scope.request.variables.enabled) {
                    compiledRequest = $variables.replace($scope.request, $scope.requestVariableValues, usedVariableValues);
                }

                if ($rester.settings.stripDefaultHeaders) {
                    compiledRequest.stripDefaultHeaders = true;
                }

                $scope.requestIsSending = true;
                $rester.sendRequest(compiledRequest)
                    .then(plainResponse => {
                        let requestClone = _.cloneDeep($scope.request);
                        requestClone.variables.values = usedVariableValues;

                        let response = {
                            status: plainResponse.status,
                            statusText: plainResponse.statusText,
                            headers: plainResponse.headers,
                            body: plainResponse.body
                        };

                        return $rester.addHistoryEntry({
                            time: new Date(plainResponse.timeStart),
                            timeEnd: new Date(plainResponse.timeEnd),
                            request: requestClone,
                            response: response
                        });
                    })
                    .then(historyId => {
                        $state.go('main.request.existing.history', {
                            id: $scope.request.id,
                            historyId: historyId
                        });
                    })
                    .catch(e => {
                        $error.show(e);
                    })
                    .finally(() => {
                        $scope.requestIsSending = false;
                    });
            };

            $scope.getResponseBadgeModifierClass = function () {
                if (!$scope.response) return;

                let status = $scope.response.status;
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

            $scope.getResponseHeadersAsString = function () {
                if (!$scope.response) return;

                return _($scope.response.headers)
                    .sortBy('name')
                    .map(h => `${h.name}: ${h.value}`)
                    .value()
                    .join('\n');
            };

            $scope.getResponseBodyHighlightLanguage = function () {
                if ($scope.response) {
                    let contentTypeHeader = $scope.response.headers.find(h => h.name.toLowerCase() === 'content-type');
                    if (contentTypeHeader) {
                        let contentType = contentTypeHeader.value;
                        if (contentType) {
                            return /[a-z-]+\/([a-z]+)([+-;].*)?/i.exec(contentType)[1];
                        }
                    }
                }
            };

            function saveRequest(saveAsNew) {
                if (saveAsNew) {
                    delete $scope.request.id;
                }

                $rester.putRequest($scope.request).then(id => {
                    $scope.request.id = id;

                    $state.go('main.request.existing', {
                        id: $scope.request.id
                    });
                });
            }

            function deleteRequest() {
                $rester.deleteRequest($scope.request).then(() => {
                    $state.go('main.request.new');
                });
            }


            $hotkeys.add(new $hotkeys.Hotkey({
                combos: ['mod+s'],
                description: 'Save the current request.',
                callback: saveRequest
            }), $scope);

            $hotkeys.add(new $hotkeys.Hotkey({
                combos: ['mod+enter'],
                description: 'Send the current request.',
                callback: $scope.sendRequest
            }), $scope);

            $rester.settingsLoaded.then(() => {
                $scope.experimentalResponseHighlighting = $rester.settings.experimentalResponseHighlighting;

                if ($rester.settings.enableRequestLintInspections) {
                    $lintInspections.add({
                        message: 'There are placeholders in your request, but the variables feature is not enabled.',
                        check () {
                            if (!$scope.request.variables.enabled) {
                                return $variables.extract($scope.request).length > 0;
                            } else {
                                return false;
                            }
                        },
                        fixLabel: 'Enable variables',
                        onFix () {
                            $scope.request.variables.enabled = true;
                        }
                    }, $scope);

                    $lintInspections.add({
                        message: 'Some variables have an empty value.',
                        check () {
                            if ($scope.request.variables.enabled) {
                                let usedVariableValues = {};
                                $variables.replace($scope.request, $scope.requestVariableValues, usedVariableValues);
                                return Object.keys(usedVariableValues).some(name => !usedVariableValues[name]);
                            } else {
                                return false;
                            }
                        },
                        fixLabel: 'View variables',
                        onFix () {
                            $scope.selectedTab = 3;
                        }
                    }, $scope);
                }
            });

        }
    ]);
