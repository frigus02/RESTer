(function () {

    window.rester = window.rester || {};
    rester.settings = {};


    const DEFAULTS = {
        activeEnvironment: null,
        stripDefaultHeaders: false,
        enableRequestLintInspections: true,
        pinSidenav: false
    };

    function hasItem(key) {
        return localStorage.hasOwnProperty(key);
    }

    function getItem(key) {
        const item = localStorage.getItem(key);
        try {
            return JSON.parse(item);
        } catch (e) {
        }
    }

    function setItem(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }


    rester.settings.onChange = rester.utils.eventListeners.create();

    rester.settings.get = function () {
        const keys = Object.keys(DEFAULTS),
              settings = {};

        for (let key of keys) {
            if (hasItem(key)) {
                settings[key] = getItem[key];
            } else {
                settings[key] = DEFAULTS[key];
            }
        }

        return settings;
    };

    rester.settings.set = function (newSettings) {
        const changedKeys = Object.keys(newSettings).filter(key => DEFAULTS.hasOwnProperty(key)),
              changedSettings = {};
        for (let key of changedKeys) {
            setItem(key, newSettings[key]);
            changedSettings[key] = newSettings[key];
        }

        rester.settings.onChange.emit(changedSettings);
    };

})();
