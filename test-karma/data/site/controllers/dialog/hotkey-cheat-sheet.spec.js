'use strict';

describe('controller: DialogHotkeyCheatSheetCtrl', function () {
    beforeEach(module('app'));

    let $controller;
    let $scope;
    let $mdDialog;
    let $hotkeys;

    beforeEach(function () {
        $scope = {};
        $mdDialog = jasmine.createSpyObj('$mdDialog', ['cancel', 'hide']);
        $hotkeys = {
            getAll: jasmine.createSpy().and.returnValue(['foo', 'bar'])
        };
    });

    beforeEach(inject(function (_$controller_) {
        $controller = _$controller_;
    }));

    beforeEach(function () {
        $controller('DialogHotkeyCheatSheetCtrl', { $scope: $scope, $mdDialog: $mdDialog, $hotkeys: $hotkeys });
    });


    it('initializes hotkeys with all hotkeys from $hotkeys service', function () {
        expect($hotkeys.getAll).toHaveBeenCalled();
        expect($scope.hotkeys).toEqual(['foo', 'bar']);
    });

    it('closes dialog on close', function () {
        $scope.close();

        expect($mdDialog.hide).toHaveBeenCalled();
    });
});
