'use strict';

const { storage } = require('sdk/simple-storage');

exports.get = function () {
    const settings = {};
    for (let key in storage) {
        if (storage.hasOwnProperty(key)) {
            settings[key] = storage[key];
        }
    }

    return settings;
};

exports.delete = function () {
    for (let key in storage) {
        if (storage.hasOwnProperty(key)) {
            delete storage[key];
        }
    }
};
