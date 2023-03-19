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
    theme: 'dark',
};

async function getSettings() {
    const result = await chrome.storage.local.get('settings');
    return result.settings || {};
}

async function setSettings(settings) {
    await chrome.storage.local.set({ settings });
}

export const e = new CustomEventTarget();

export function get() {
    return getSettings().then((settings) => {
        const keys = Object.keys(DEFAULTS);
        for (let key of keys) {
            if (!Object.prototype.hasOwnProperty.call(settings, key)) {
                settings[key] = DEFAULTS[key];
            }
        }

        return settings;
    });
}

export function set(newSettings) {
    // Filter for keys, which actually exist.
    const changedKeys = Object.keys(newSettings).filter((key) =>
        Object.prototype.hasOwnProperty.call(DEFAULTS, key)
    );
    const changedSettings = {};
    for (let key of changedKeys) {
        changedSettings[key] = newSettings[key];
    }

    return getSettings()
        .then((settings) => {
            Object.assign(settings, changedSettings);
            return setSettings(settings);
        })
        .then(() => {
            e.dispatchEvent(
                new CustomEvent('change', {
                    detail: changedSettings,
                })
            );
        });
}
