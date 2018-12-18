import CustomEventTarget from '../../shared/custom-event-target.js';

const DEFAULTS = {
    activeEnvironment: null,
    stripDefaultHeaders: false,
    enableRequestLintInspections: true,
    pinSidenav: false,
    requestBodyFullSize: false,
    responseBodyWrap: true,
    responseBodyPrettyPrint: true,
    responseBodyFullSize: false,
    responseBodyPreview: false,
    showVariablesOnSide: false,
    requestPageFullWidth: false,
    theme: 'dark'
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
        chrome.storage.local.set({ settings }, () => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve();
            }
        });
    });
}

export const e = new CustomEventTarget();

export function get() {
    return getSettings().then(settings => {
        const keys = Object.keys(DEFAULTS);
        for (let key of keys) {
            if (!settings.hasOwnProperty(key)) {
                settings[key] = DEFAULTS[key];
            }
        }

        return settings;
    });
}

export function set(newSettings) {
    // Filter for keys, which actually exist.
    const changedKeys = Object.keys(newSettings).filter(key =>
        DEFAULTS.hasOwnProperty(key)
    );
    const changedSettings = {};
    for (let key of changedKeys) {
        changedSettings[key] = newSettings[key];
    }

    return getSettings()
        .then(settings => {
            Object.assign(settings, changedSettings);
            return setSettings(settings);
        })
        .then(() => {
            e.dispatchEvent(
                new CustomEvent('change', {
                    detail: changedSettings
                })
            );
        });
}
