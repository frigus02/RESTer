'use strict';

const { storage } = require("sdk/simple-storage"),
      { emit } = require('sdk/event/core'),
      { EventTarget } = require("sdk/event/target");

const DEFAULTS = {
    activeEnvironment: null,
    stripDefaultHeaders: false,
    enableRequestLintInspections: true,
    pinSidenav: false,
    experimentalResponseHighlighting: false
};

module.exports = EventTarget();

module.exports.get = function () {
    const keys = Object.keys(DEFAULTS),
          settings = {};

    for (let key of keys) {
        if (storage.hasOwnProperty(key)) {
            settings[key] = storage[key];
        } else {
            settings[key] = DEFAULTS[key];
        }
    }

    return settings;
};

module.exports.set = function (newSettings) {
    const changedKeys = Object.keys(newSettings).filter(key => DEFAULTS.hasOwnProperty(key)),
          changedSettings = {};
    for (let key of changedKeys) {
        storage[key] = newSettings[key];
        changedSettings[key] = newSettings[key];
    }

    emit(module.exports, 'change', changedSettings);
};
