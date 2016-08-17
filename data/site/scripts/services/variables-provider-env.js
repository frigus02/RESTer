'use strict';

angular.module('app')
    .service('$variablesProviderEnv', ['$rester', '$settings', function ($rester, $settings) {
        let self = this;

        self.name = 'env';
        self.values = {};

        function updateValues() {
            let envId = $settings.activeEnvironment;
            if (envId) {
                $rester.getEnvironment(envId).then(env => {
                    self.values = env.values;
                });
            } else {
                self.values = {};
            }
        }

        updateValues();
        $rester.addEventListener('dataChange', updateValues);
        $settings.addChangeListener(updateValues);

    }]);
