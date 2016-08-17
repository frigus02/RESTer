'use strict';

exports.migrateHeadersObjectToArray = function (headers) {
    if (Array.isArray(headers)) return headers;

    return Object.keys(headers).map(name => ({
        name: name,
        value: headers[name]
    }));
};

exports.migrateVariablesObject = function (variables) {
    if (!variables) {
        return {enabled: false};
    } else {
        if (!variables.hasOwnProperty('enabled')) {
            variables.enabled = false;
        }

        return variables;
    }
};
