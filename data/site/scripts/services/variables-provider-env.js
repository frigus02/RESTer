'use strict';

angular.module('app')
    .service('$variablesProviderEnv', ['$data', '$settings', function ($data, $settings) {
        let self = this;

        self.name = 'env';
        self.values = {};

        function updateValues() {
            let envId = $settings.activeEnvironment;
            if (envId) {
                $data.getEnvironment(envId).then(env => {
                    self.values = env.values;
                });
            } else {
                self.values = {};
            }
        }

        updateValues();
        $data.addChangeListener(updateValues);
        $settings.addChangeListener(updateValues);

    }]);
