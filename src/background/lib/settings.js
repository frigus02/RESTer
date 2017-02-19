(function () {
    'use strict';

    window.rester = window.rester || {};
    rester.settings = {};


    const DEFAULTS = {
        activeEnvironment: null,
        stripDefaultHeaders: false,
        enableRequestLintInspections: true,
        pinSidenav: false,
        responseBodyWrap: true,
        responseBodyPrettyPrint: true,
        responseBodyFullSize: false,
        responseBodyPreview: false
    };

    function getSettings() {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get('settings', result => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(result.settings || {});
                }
            });
        });
    }

    function setSettings(settings) {
        return new Promise((resolve, reject) => {
            chrome.storage.local.set({settings}, () => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve();
                }
            });
        });
    }


    rester.settings.onChange = rester.utils.eventListeners.create();

    rester.settings.get = function () {
        return getSettings().then(settings => {
            const keys = Object.keys(DEFAULTS);
            for (let key of keys) {
                if (!settings.hasOwnProperty(key)) {
                    settings[key] = DEFAULTS[key];
                }
            }

            return settings;
        });
    };

    rester.settings.set = function (newSettings) {
        // Filter for keys, which actually exist.
        const changedKeys = Object.keys(newSettings).filter(key => DEFAULTS.hasOwnProperty(key));
        const changedSettings = {};
        for (let key of changedKeys) {
            changedSettings[key] = newSettings[key];
        }

        return getSettings().then(settings => {
            Object.assign(settings, changedSettings);
            return setSettings(settings);
        }).then(() => {
            rester.settings.onChange.emit(changedSettings);
        });
    };
})();
