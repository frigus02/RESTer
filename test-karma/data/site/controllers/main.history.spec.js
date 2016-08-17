'use strict';

describe('controller: HistoryCtrl', function () {
    beforeEach(module('app'));

    let $controller;
    let $q;
    let $rootScope;
    let $scope;
    let $state;
    let $rester;
    let $variables;
    let $resterGetHistoryEntriesDeferred;
    let $resterDeleteHistoryEntryDeferred;

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
        $resterGetHistoryEntriesDeferred = $q.defer();
        $resterDeleteHistoryEntryDeferred = $q.defer();
        $rester = {
            getHistoryEntries: jasmine.createSpy().and.returnValue($resterGetHistoryEntriesDeferred.promise),
            deleteHistoryEntry: jasmine.createSpy().and.returnValue($resterDeleteHistoryEntryDeferred.promise)
        };
        $variables = {
            replace: jasmine.createSpy().and.returnValue({})
        };
    });


    beforeEach(function () {
        $controller('HistoryCtrl', { $scope: $scope, $state: $state, $rester: $rester, $variables: $variables });
    });


    it('initializes properties', function () {
        expect($state.current.data.title).toBe('History');

        expect($scope.initialCount).toBe(50);
        expect($scope.historyEntries).toEqual([]);

        expect($rester.getHistoryEntries).toHaveBeenCalledWith(-50);

        let entries = [1, 2, 3];
        $resterGetHistoryEntriesDeferred.resolve(entries);
        $rootScope.$apply();

        expect($scope.historyEntries).toEqual(entries);
    });

    it('compiles request using $variables service, when variables is enabled', function () {
        let entry = {
            request: {
                method: 'GET',
                url: 'test',
                variables: {
                    enabled: false,
                    values: {
                        id: '123'
                    }
                }
            }
        };

        let result1 = $scope.getCompiledRequestLine(entry);
        expect(result1).toBe('GET test');
        expect($variables.replace).not.toHaveBeenCalled();

        entry.request.variables.enabled = true;
        let result2 = $scope.getCompiledRequestLine(entry);
        expect(result2).toBe('undefined undefined');
        expect($variables.replace).not.toHaveBeenCalledWith(entry, entry.request.variables.values);
    });

    it('gets all history entries on loadAll', function () {

        $scope.loadAll();

        expect($rester.getHistoryEntries).toHaveBeenCalledWith();

        let entries = [1, 2, 3, 4];
        $resterGetHistoryEntriesDeferred.resolve(entries);
        $rootScope.$apply();

        expect($scope.historyEntries).toEqual(entries);
    });

    it('navigates to specified request state on openHistoryEntry', function () {
        let entry = {
            id: Math.random(),
            request: {
                id: Math.random()
            }
        };

        $scope.openHistoryEntry(entry);

        expect($state.go).toHaveBeenCalledWith('main.request.existing.history', {
            id: entry.request.id,
            historyId: entry.id
        });
    });

    it('deletes the specified entry on deleteHistoryEntry', function () {
        $scope.historyEntries = [
            { id: 1 },
            { id: 2 }
        ];

        $scope.deleteHistoryEntry($scope.historyEntries[0]);

        expect($rester.deleteHistoryEntry).toHaveBeenCalledWith($scope.historyEntries[0]);

        $resterDeleteHistoryEntryDeferred.resolve();
        $rootScope.$apply();

        expect($scope.historyEntries.length).toBe(1);
        expect($scope.historyEntries[0].id).toBe(2);
    });
});
