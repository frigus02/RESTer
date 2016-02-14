'use strict';

describe('controller: DialogHighlightCodeChangeLanguageCtrl', function () {
    beforeEach(module('app'));

    let $controller;
    let $scope;
    let $mdDialog;
    let hljsListLanguages;

    beforeEach(function () {
        $scope = {};
        $mdDialog = jasmine.createSpyObj('$mdDialog', ['cancel', 'hide']);
        hljsListLanguages = spyOn(window.hljs, 'listLanguages').and.returnValue(['json', 'java', 'xml']);
    });

    beforeEach(inject(function (_$controller_) {
        $controller = _$controller_;
    }));

    beforeEach(function () {
        $controller('DialogHighlightCodeChangeLanguageCtrl', { $scope: $scope, $mdDialog: $mdDialog });
    });


    it('initializes searchText with an empty string', function () {
        expect($scope.searchText).toBe('');
    });

    it('returns filtered and sorted languages on queryLanguages', function () {
        expect($scope.queryLanguages('J')).toEqual(['java', 'json']);
        expect($scope.queryLanguages('ml')).toEqual(['xml']);
    });

    it('generates and returns token on save', function () {
        $scope.selectLanguage('json');

        expect($mdDialog.hide).toHaveBeenCalledWith('json');
    });
});
