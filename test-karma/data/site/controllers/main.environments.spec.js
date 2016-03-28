'use strict';

describe('controller: EnvironmentsCtrl', function () {
    beforeEach(module('app'));

    let $controller;
    let $q;
    let $rootScope;

    let $scope;
    let $state;
    let $data;
    let $settings;
    let $mdDialog;

    let $dataGetEnvironmentsDeferred;
    let $dataPutEnvironmentDeferred;
    let $dataDeleteEnvironmentDeferred;
    let $mdDialogShowDeferred;

    beforeEach(inject(function (_$controller_, _$q_, _$rootScope_) {
        $controller = _$controller_;
        $q = _$q_;
        $rootScope = _$rootScope_;
    }));

    beforeEach(function () {
        $scope = {};
        $state = {
            current: {},
            go: jasmine.createSpy()
        };
        $dataGetEnvironmentsDeferred = $q.defer();
        $dataPutEnvironmentDeferred = $q.defer();
        $dataDeleteEnvironmentDeferred = $q.defer();
        $data = {
            getEnvironments: jasmine.createSpy().and.returnValue($dataGetEnvironmentsDeferred.promise),
            putEnvironment: jasmine.createSpy().and.returnValue($dataPutEnvironmentDeferred.promise),
            deleteEnvironment: jasmine.createSpy().and.returnValue($dataDeleteEnvironmentDeferred.promise)
        };
        $settings = {
            activeEnvironment: 1
        };
        $mdDialogShowDeferred = $q.defer();
        $mdDialog = {
            show: jasmine.createSpy().and.returnValue($mdDialogShowDeferred.promise)
        };
    });


    beforeEach(function () {
        $controller('EnvironmentsCtrl', { $scope: $scope, $state: $state, $data: $data, $settings: $settings, $mdDialog: $mdDialog });
    });


    it('initializes properties', function () {
        expect($state.current.data.title).toBe('Environments');

        expect($scope.environments).toEqual([]);
        expect($scope.settings).toBe($settings);

        expect($data.getEnvironments).toHaveBeenCalled();

        let environments = [1, 2, 3];
        $dataGetEnvironmentsDeferred.resolve(environments);
        $rootScope.$apply();

        expect($scope.environments).toEqual(environments);
    });

    it('opens edit-environment dialog with empty environment on addEnvironment', function () {
        // Show dialog
        let $event = {};
        $scope.addEnvironment($event);

        expect($mdDialog.show).toHaveBeenCalledWith({
            targetEvent: $event,
            templateUrl: 'views/dialogs/edit-environment.html',
            controller: 'DialogEditEnvironmentCtrl',
            locals: {
                environment: undefined
            }
        });

        // Save environment, when dialog is closed
        let environment = {
            name: 'dev',
            values: {host: 'example.com'}
        };
        $mdDialogShowDeferred.resolve(environment);
        $rootScope.$apply();

        expect($data.putEnvironment).toHaveBeenCalledWith(environment);

        // Update environments in scope
        $dataPutEnvironmentDeferred.resolve();
        $rootScope.$apply();

        expect($scope.environments).toEqual([environment]);
    });

    it('opens edit-environment dialog with existing environment on editEnvironment', function () {
        // Show dialog
        let $event = {},
            environment = {
                name: 'dev',
                values: {host: 'example.com'}
            };
        $scope.environments.push(environment);
        $scope.editEnvironment($event, environment);

        expect($mdDialog.show).toHaveBeenCalledWith({
            targetEvent: $event,
            templateUrl: 'views/dialogs/edit-environment.html',
            controller: 'DialogEditEnvironmentCtrl',
            locals: {
                environment: environment
            }
        });

        // Save environment, when dialog is closed
        let updatedEnvironment = {
            name: 'dev',
            values: {host: 'example.com', port: '1234'}
        };
        $mdDialogShowDeferred.resolve(updatedEnvironment);
        $rootScope.$apply();

        expect($data.putEnvironment).toHaveBeenCalledWith(updatedEnvironment);

        // Update environments in scope
        $dataPutEnvironmentDeferred.resolve();
        $rootScope.$apply();

        expect($scope.environments).toEqual([updatedEnvironment]);
    });


    it('deletes environment, when edit-environment dialog was closed with "delete" result', function () {
        // Show dialog
        let $event = {},
            environment = {
                name: 'dev',
                values: {host: 'example.com'}
            };
        $scope.environments.push(environment);
        $scope.editEnvironment($event, environment);

        expect($mdDialog.show).toHaveBeenCalledWith({
            targetEvent: $event,
            templateUrl: 'views/dialogs/edit-environment.html',
            controller: 'DialogEditEnvironmentCtrl',
            locals: {
                environment: environment
            }
        });

        // Save environment, when dialog is closed
        $mdDialogShowDeferred.resolve('delete');
        $rootScope.$apply();

        expect($data.deleteEnvironment).toHaveBeenCalledWith(environment);

        // Update environments in scope
        $dataDeleteEnvironmentDeferred.resolve();
        $rootScope.$apply();

        expect($scope.environments).toEqual([]);
    });
});
