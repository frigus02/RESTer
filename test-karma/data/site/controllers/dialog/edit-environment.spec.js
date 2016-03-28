'use strict';

describe('controller: DialogEditEnvironmentCtrl', function () {
    beforeEach(module('app'));

    let $controller;
    let $rootScope;
    let $scope;
    let $mdDialog;
    let $data;

    beforeEach(function () {
        $scope = {
            $watch: jasmine.createSpy()
        };
        $mdDialog = jasmine.createSpyObj('$mdDialog', ['cancel', 'hide']);
        $data = {
            Environment: function () {
                this.name = '';
                this.values = {};
            }
        };
    });

    beforeEach(inject(function (_$controller_, _$rootScope_) {
        $controller = _$controller_;
        $rootScope = _$rootScope_;
    }));


    describe('create new environment', function () {
        beforeEach(function () {
            $controller('DialogEditEnvironmentCtrl', { $scope: $scope, $mdDialog: $mdDialog, $data: $data, environment: undefined });
        });


        it('initializes environment with an empty Environment object', function () {
            expect($scope.environment).toEqual(jasmine.any($data.Environment));
        });

        it('adds a new empty value when all existing values contain some text', function () {
            expect($scope.values).toEqual([]);
            expect($scope.$watch).toHaveBeenCalledWith('values', jasmine.any(Function), true);

            let valuesWatch = $scope.$watch.calls.argsFor(0)[1],
                expectedValues = [{ key: '', value: '' }];

            // Initially the values are empty. So after the watch listener, they
            // should contain one empty element.
            valuesWatch();

            expect($scope.values).toEqual(expectedValues);

            // After writing text to the element, it should add one more empty element.
            $scope.values[0].key = 'test';
            expect(valuesWatch()).toBe(true);
            expectedValues.unshift({ key: 'test', value: '' });

            expect($scope.values).toEqual(expectedValues);

            // Nothing has changed. The watch listener shouldn't do anything.
            expect(valuesWatch()).toBe(false);

            expect($scope.values).toEqual(expectedValues);
        });

        it('removes the specified value on removeValue', function () {
            $scope.values = [
                {key: 'test', value: '123'},
                {key: '', value: ''}
            ];

            $scope.removeValue(0);

            expect($scope.values).toEqual([
                {key: '', value: ''}
            ]);
        });

        it('closes dialog on cancel', function () {
            $scope.cancel();

            expect($mdDialog.cancel).toHaveBeenCalled();
        });

        it('transforms values and returns environment on save', function () {
            expect($scope.environment.values).toEqual({});

            $scope.values = [
                {key: 'host', value: 'example.com'},
                {key: '', value: ''},
                {key: 'port', value: '1234'}
            ];

            $scope.save();

            expect($scope.environment.values).toEqual({
                host: 'example.com',
                port: '1234'
            });
            expect($mdDialog.hide).toHaveBeenCalledWith($scope.environment);
        });
    });

    describe('edit existing environment', function () {
        let environment = {
            id: 1,
            name: 'dev',
            values: {
                host: 'example.com',
                port: '1234'
            }
        };

        beforeEach(function () {
            $controller('DialogEditEnvironmentCtrl', { $scope: $scope, $mdDialog: $mdDialog, $data: $data, environment: environment });
        });


        it('initializes environment with injected environment object', function () {
            expect($scope.environment).toBe(environment);
        });

        it('returns "delete" on delete', function () {
            $scope.delete();

            expect($mdDialog.hide).toHaveBeenCalledWith('delete');
        });
    });
});
