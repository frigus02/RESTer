'use strict';

describe('controller: EnvironmentsCtrl', function () {
    beforeEach(module('app'));

    let $controller;
    let $q;
    let $rootScope;

    let $scope;
    let $state;
    let $rester;
    let $mdDialog;

    let $resterGetEnvironmentsDeferred;
    let $resterPutEnvironmentDeferred;
    let $resterDeleteEnvironmentDeferred;
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
        $resterGetEnvironmentsDeferred = $q.defer();
        $resterPutEnvironmentDeferred = $q.defer();
        $resterDeleteEnvironmentDeferred = $q.defer();
        $rester = {
            getEnvironments: jasmine.createSpy().and.returnValue($resterGetEnvironmentsDeferred.promise),
            putEnvironment: jasmine.createSpy().and.returnValue($resterPutEnvironmentDeferred.promise),
            deleteEnvironment: jasmine.createSpy().and.returnValue($resterDeleteEnvironmentDeferred.promise),
            settings: {
                activeEnvironment: 1
            }
        };
        $mdDialogShowDeferred = $q.defer();
        $mdDialog = {
            show: jasmine.createSpy().and.returnValue($mdDialogShowDeferred.promise)
        };
    });


    beforeEach(function () {
        $controller('EnvironmentsCtrl', { $scope: $scope, $state: $state, $rester: $rester, $mdDialog: $mdDialog });
    });


    it('initializes properties', function () {
        expect($state.current.data.title).toBe('Environments');

        expect($scope.environments).toEqual([]);
        expect($scope.settings).toBe($rester.settings);

        expect($rester.getEnvironments).toHaveBeenCalled();

        let environments = [1, 2, 3];
        $resterGetEnvironmentsDeferred.resolve(environments);
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

        expect($rester.putEnvironment).toHaveBeenCalledWith(environment);

        // Update environments in scope
        $resterPutEnvironmentDeferred.resolve();
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

        expect($rester.putEnvironment).toHaveBeenCalledWith(updatedEnvironment);

        // Update environments in scope
        $resterPutEnvironmentDeferred.resolve();
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

        expect($rester.deleteEnvironment).toHaveBeenCalledWith(environment);

        // Update environments in scope
        $resterDeleteEnvironmentDeferred.resolve();
        $rootScope.$apply();

        expect($scope.environments).toEqual([]);
    });
});
