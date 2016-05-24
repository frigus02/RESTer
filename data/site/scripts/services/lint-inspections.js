'use strict';

angular.module('app')
    .factory('$lintInspections', ['$rootScope', function ($rootScope) {

        function fireListeners(listeners, ...args) {
            listeners.forEach(l => {
                l(...args);
            });
        }

        class LintInspections {
            constructor () {
                this.changeListeners = [];
                this.inspections = [];
                this.failedInspections = [];

                $rootScope.$watch(_.debounce(this.checkInspections.bind(this), 500));
            }

            addChangeListener (listener) {
                this.changeListeners.push(listener);

                return () => {
                    const index = this.changeListeners.indexOf(listener);
                    this.changeListeners.splice(index, 1);
                };
            }

            /**
             * Registers a new inspection, which is automatically removed,
             * when the specified scope is destroyed.
             *
             * @param {String} options.message Descriptive message.
             * @param {Function} options.check Function, which returns true,
             *                                 when an issue was detected.
             * @param {String} options.fixLabel Label for the fix button.
             * @param {Function} options.onFix Action, executed when the user
             *                                 clicks on the fix button. If
             *                                 undefined, the fix button will
             *                                 be hidden.
             * @param {Function} options.onDismiss Action, executed when the
             *                                     user clicks on the dismiss
             *                                     button.
             * @param {Object} $scope An angular scope object. When specified,
             *                        the inspection will automatically be
             *                        removed, when the scope is destroyed.
             */
            add ({message, check, fixLabel, onFix, onDismiss}, $scope) {
                const inspection = {
                    message,
                    check,
                    fixLabel,
                    fix: onFix
                };

                const remove = () => {
                    const index = this.inspections.indexOf(inspection);
                    if (index >= 0) {
                        this.inspections.splice(index, 1);
                        fireListeners(this.changeListeners);
                    }
                };

                inspection.dismiss = function () {
                    if (onDismiss) {
                        onDismiss();
                    }

                    remove();
                };

                this.inspections.push(inspection);

                if ($scope) {
                    $scope.$on('$destroy', remove);
                }

                return remove;
            }

            checkInspections () {
                let changed = false;
                this.inspections.forEach(inspection => {
                    const result = inspection.check();
                    if (result !== inspection.foundIssue) {
                        inspection.foundIssue = result;
                        changed = true;
                    }
                });

                if (changed) {
                    $rootScope.$applyAsync(() => {
                        fireListeners(this.changeListeners);
                    });
                }
            }

            getIssues () {
                return this.inspections.filter(inspection => inspection.foundIssue);
            }
        }

        return new LintInspections();

    }]);
