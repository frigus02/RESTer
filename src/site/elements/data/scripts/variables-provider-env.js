(function () {
    'use strict';

    const self = RESTer.register('variables.providers.env', ['eventListeners']);

    self.values = {};

    function updateValues() {
        let envId = RESTer.rester.settings.activeEnvironment;
        if (envId) {
            RESTer.rester.getEnvironment(envId).then(env => {
                self.values = env ? env.values : {};
                self.fireEvent('valuesChanged', self.values);
            });
        } else {
            self.values = {};
            self.fireEvent('valuesChanged', self.values);
        }
    }

    RESTer.rester.settingsLoaded.then(updateValues);
    RESTer.rester.addEventListener('dataChange', updateValues);
    RESTer.rester.addEventListener('settingsChange', updateValues);
})();
