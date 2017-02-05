(function () {
    'use strict';

    const self = RESTer.register('encode');

    self.encodeQueryString = function (params) {
        return Object.keys(params)
            .map(p => `${p}=${encodeURIComponent(params[p])}`)
            .join('&');
    };

    self.decodeQueryString = function (str) {
        return str.split('&').reduce((params, currentParam) => {
            const keyValue = currentParam.split('=');
            params[keyValue[0]] = decodeURIComponent(keyValue[1]);
            return params;
        }, {});
    };

    self.generateUri = function (base, params) {
        return base + '?' + self.encodeQueryString(params);
    };

    self.mapFilesToVariableValues = function (files) {
        const values = {};
        Object.keys(files).forEach(key => {
            values[`$file.${key}`] = files[key];
        });

        return values;
    };
})();
