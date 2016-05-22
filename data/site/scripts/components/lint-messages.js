'use strict';

angular.module('app')
    .component('lintMessages', {
        templateUrl: 'views/components/lint-messages.html',
        controller: ['$lintInspections', function ($lintInspections) {

            const ctrl = this;
            let removeInspectionsChangeListener;

            function onInspectionsChanged() {
                ctrl.issues = $lintInspections.getIssues();
            }

            ctrl.$onInit = function () {
                ctrl.issues = $lintInspections.getIssues();
                removeInspectionsChangeListener = $lintInspections.addChangeListener(onInspectionsChanged);
            };

            ctrl.$onDestroy = function () {
                removeInspectionsChangeListener();
            };

        }]
    });
