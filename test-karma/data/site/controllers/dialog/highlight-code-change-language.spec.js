'use strict';

describe('controller: DialogHighlightCodeChangeLanguageCtrl', function () {
    beforeEach(module('app'));

    let $controller;
    let $scope;
    let $mdDialog;

    beforeEach(function () {
        $scope = {};
        $mdDialog = jasmine.createSpyObj('$mdDialog', ['hide']);
    });

    beforeEach(inject(function (_$controller_) {
        $controller = _$controller_;
    }));

    describe('valid currentLanguage', function () {
        beforeEach(function () {
            $controller('DialogHighlightCodeChangeLanguageCtrl', { $scope: $scope, $mdDialog: $mdDialog, currentLanguage: 'js' });
        });

        it('initializes languages with a list of all supported languages', function () {
            expect($scope.languages.length).toBe(9);
        });

        it('initializes selectedLanguage with correct object from languages array', function () {
            expect($scope.selectedLanguage).toBe($scope.languages[5]);
        });

        it('generates and returns token on save', function () {
            $scope.selectLanguage({
                name: 'json'
            });

            expect($mdDialog.hide).toHaveBeenCalledWith('json');
        });
    });

    describe('unknown currentLanguage', function () {
        beforeEach(function () {
            $controller('DialogHighlightCodeChangeLanguageCtrl', { $scope: $scope, $mdDialog: $mdDialog, currentLanguage: 'xxx' });
        });

        it('initializes selectedLanguage with undefined', function () {
            expect($scope.selectedLanguage).toBeUndefined();
        });
    });
});
