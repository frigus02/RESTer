'use strict';

angular.module('app')
    .service('$error', ['$mdDialog', function ($mdDialog) {
        let self = this;

        const TITLES = [
            'Ups, something went wrong!',
            'Oh no, this shouldn\'t happen.'
        ];

        function extractMessage(error) {
            if (typeof error === 'string') {
                return error;
            } else if (error.message) {
                return error.message;
            } else {
                try {
                    return JSON.stringify(error);
                } catch (e) {
                    return 'Unknown error.';
                }
            }
        }

        self.show = function (error) {
            $mdDialog.show({
                template: `
                    <md-dialog class="error-dialog">
                        <md-dialog-content class="md-dialog-content">
                            <h2 class="md-title">{{dialog.title}}</h2>
                            <div class="md-dialog-content-body">
                                <p ng-repeat="line in dialog.message">{{line}}</p>
                            </div>
                        </md-dialog-content>
                        <md-dialog-actions>
                            <md-button ng-click="dialog.hide()" class="md-primary md-confirm-button" md-autofocus="true">
                                OK
                            </md-button>
                        </md-dialog-actions>
                    </md-dialog>`,
                locals: {
                    message: extractMessage(error)
                },
                controller: function ($scope, $mdDialog, message) {
                    this.title = _.sample(TITLES);
                    this.message = message.split('\n');
                    this.hide = function () {
                        $mdDialog.hide();
                    };
                },
                controllerAs: 'dialog'
            });
        };

    }]);
