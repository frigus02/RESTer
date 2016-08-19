'use strict';

describe('controller: SettingsCtrl', function () {
    beforeEach(module('app'));

    let $controller;

    let $scope;
    let $state;
    let $rester;

    beforeEach(inject(function (_$controller_) {
        $controller = _$controller_;
    }));

    beforeEach(function () {
        $scope = {};
        $state = {
            current: {}
        };
        $rester = {
            settings: {
                stripDefaultSettings: 1
            }
        };
    });


    beforeEach(function () {
        $controller('SettingsCtrl', { $scope: $scope, $state: $state, $rester: $rester });
    });


    it('initializes properties', function () {
        expect($state.current.data.title).toBe('Settings');

        expect($scope.settings).toBe($rester.settings);
    });
});
