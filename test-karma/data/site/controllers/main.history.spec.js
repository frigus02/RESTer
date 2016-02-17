'use strict';

describe('controller: HistoryCtrl', function () {
    beforeEach(module('app'));

    let $controller;
    let $q;
    let $rootScope;
    let $scope;
    let $state;
    let $data;
    let $dataGetHistoryEntriesDeferred;
    let $dataDeleteHistoryEntryDeferred;

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
        $dataGetHistoryEntriesDeferred = $q.defer();
        $dataDeleteHistoryEntryDeferred = $q.defer();
        $data = {
            getHistoryEntries: jasmine.createSpy().and.returnValue($dataGetHistoryEntriesDeferred.promise),
            deleteHistoryEntry: jasmine.createSpy().and.returnValue($dataDeleteHistoryEntryDeferred.promise)
        };
    });


    beforeEach(function () {
        $controller('HistoryCtrl', { $scope: $scope, $state: $state, $data: $data });
    });


    it('initializes properties', function () {
        expect($state.current.data.title).toBe('History');

        expect($scope.initialCount).toBe(50);
        expect($scope.historyEntries).toEqual([]);

        expect($data.getHistoryEntries).toHaveBeenCalledWith(-50);

        let entries = [1, 2, 3];
        $dataGetHistoryEntriesDeferred.resolve(entries);
        $rootScope.$apply();

        expect($scope.historyEntries).toEqual(entries);
    });

    it('gets all history entries on loadAll', function () {

        $scope.loadAll();

        expect($data.getHistoryEntries).toHaveBeenCalledWith();

        let entries = [1, 2, 3, 4];
        $dataGetHistoryEntriesDeferred.resolve(entries);
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

        expect($data.deleteHistoryEntry).toHaveBeenCalledWith($scope.historyEntries[0]);

        $dataDeleteHistoryEntryDeferred.resolve();
        $rootScope.$apply();

        expect($scope.historyEntries.length).toBe(1);
        expect($scope.historyEntries[0].id).toBe(2);
    });
});
