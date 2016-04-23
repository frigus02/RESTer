'use strict';

describe('controller: SettingsCtrl', function () {
    beforeEach(module('app'));

    let $controller;

    let $scope;
    let $state;
    let $settings;

    beforeEach(inject(function (_$controller_) {
        $controller = _$controller_;
    }));

    beforeEach(function () {
        $scope = {};
        $state = {
            current: {}
        };
        $settings = {
            stripDefaultSettings: 1
        };
    });


    beforeEach(function () {
        $controller('SettingsCtrl', { $scope: $scope, $state: $state, $settings: $settings });
    });


    it('initializes properties', function () {
        expect($state.current.data.title).toBe('Settings');

        expect($scope.settings).toBe($settings);
    });
});
