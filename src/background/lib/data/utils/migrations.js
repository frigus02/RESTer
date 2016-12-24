(function () {

    window.rester = window.rester || {};
    rester.data = rester.data || {};
    rester.data.utils = rester.data.utils || {};
    rester.data.utils.migrations = {};


    rester.data.utils.migrations.migrateHeadersObjectToArray = function (headers) {
        if (Array.isArray(headers)) return headers;

        return Object.keys(headers).map(name => ({
            name: name,
            value: headers[name]
        }));
    };

    rester.data.utils.migrations.migrateVariablesObject = function (variables) {
        if (!variables) {
            return {enabled: false};
        } else {
            if (!variables.hasOwnProperty('enabled')) {
                variables.enabled = false;
            }

            return variables;
        }
    };

})();
