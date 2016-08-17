'use strict';

angular.module('app')
    .controller('EnvironmentsCtrl', ['$scope', '$state', '$rester', '$settings', '$mdDialog',
        function ($scope, $state, $rester, $settings, $mdDialog) {

            $state.current.data = {
                title: 'Environments'
            };

            $scope.environments = [];
            $scope.settings = $settings;

            $rester.getEnvironments().then(envs => {
                $scope.environments = envs;
            });

            function showEditEnvironmentDialog($event, env) {
                $mdDialog.show({
                    targetEvent: $event,
                    templateUrl: 'views/dialogs/edit-environment.html',
                    controller: 'DialogEditEnvironmentCtrl',
                    locals: {
                        environment: angular.copy(env)
                    }
                }).then(updatedEnv => {
                    if (updatedEnv === 'delete') {
                        $rester.deleteEnvironment(env).then(() => {
                            let index = $scope.environments.indexOf(env);
                            $scope.environments.splice(index, 1);
                        });
                    } else {
                        $rester.putEnvironment(updatedEnv).then(id => {
                            updatedEnv.id = id;

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
                showEditEnvironmentDialog($event);
            };

            $scope.editEnvironment = function ($event, environment) {
                showEditEnvironmentDialog($event, environment);
            };

        }
    ]);
