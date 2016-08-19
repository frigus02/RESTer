'use strict';

angular.module('app')
    .service('$variablesProviderEnv', ['$rester', function ($rester) {
        let self = this;

        self.name = 'env';
        self.values = {};

        function updateValues() {
            let envId = $rester.settings.activeEnvironment;
            if (envId) {
                $rester.getEnvironment(envId).then(env => {
                    self.values = env.values;
                });
            } else {
                self.values = {};
            }
        }

        $rester.settingsLoaded.then(updateValues);
        $rester.addEventListener('dataChange', updateValues);
        $rester.addEventListener('settingsChange', updateValues);

    }]);
