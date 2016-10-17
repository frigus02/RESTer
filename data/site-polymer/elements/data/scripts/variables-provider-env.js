(function () {

    const self = RESTer.register('variables.providers.$env');

    self.values = {};

    function updateValues() {
        let envId = RESTer.rester.settings.activeEnvironment;
        if (envId) {
            RESTer.rester.getEnvironment(envId).then(env => {
                self.values = env.values;
            });
        } else {
            self.values = {};
        }
    }

    RESTer.rester.settingsLoaded.then(updateValues);
    RESTer.rester.addEventListener('dataChange', updateValues);
    RESTer.rester.addEventListener('settingsChange', updateValues);

})();
