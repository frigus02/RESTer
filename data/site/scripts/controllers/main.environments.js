'use strict';

angular.module('app')
    .controller('EnvironmentsCtrl', ['$scope', '$state', '$data', '$mdDialog',
        function ($scope, $state, $data, $mdDialog) {

            $state.current.data = {
                title: 'Environments'
            };

            $scope.environments = [];

            $data.getEnvironments().then(envs => {
                $scope.environments = envs;
            });

            function showEditEnvironment($event, env) {
                $mdDialog.show({
                    targetEvent: $event,
                    templateUrl: 'views/dialogs/edit-environment.html',
                    controller: 'DialogEditEnvironmentCtrl',
                    locals: {
                        environment: angular.copy(env)
                    }
                }).then(updatedEnv => {
                    if (updatedEnv === 'delete') {
                        $data.deleteEnvironment(env).then(() => {
                            let index = $scope.environments.indexOf(env);
                            $scope.environments.splice(index, 1);
                        });
                    } else {
                        $data.putEnvironment(updatedEnv).then(() => {
                            if (env) {
                                Object.assign(env, updatedEnv);
                            } else {
                                $scope.environments.push(updatedEnv);
                            }
                        });
                    }
                });
            }

            $scope.addEnvironment = function ($event) {
                showEditEnvironment($event);
            };

            $scope.editEnvironment = function ($event, environment) {
                showEditEnvironment($event, environment);
            };

        }
    ]);
