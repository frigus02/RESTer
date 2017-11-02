(function () {
    'use strict';

    const self = RESTer.register('encode');

    function appendSearchParams(searchParams, params) {
        for (const key in params) {
            if (params.hasOwnProperty(key)) {
                const values = Array.isArray(params[key]) ? params[key] : [params[key]];
                for (const value of values) {
                    searchParams.append(key, value);
                }
            }
        }
    }

    self.encodeQueryString = function (params) {
        const searchParams = new URLSearchParams();
        appendSearchParams(searchParams, params);

        return searchParams.toString();
    };

    self.decodeQueryString = function (str) {
        const params = {};
        const searchParams = new URLSearchParams(str);
        for (const key of searchParams.keys()) {
            const values = searchParams.getAll(key);
            if (values.length === 1) {
                params[key] = values[0];
            } else {
                params[key] = values;
            }
        }

        return params;
    };

    self.generateUri = function (base, params) {
        const url = new URL(base);
        appendSearchParams(url.searchParams, params);

        return url.toString();
    };

    self.encodeFormValue = function (value) {
        const encoded = encodeURIComponent(value);

        // The characters { and } are required for variables to work correctly.
        return encoded.replace(/%(?:7B|7D)/g, unescape);
    };

    self.mapFilesToVariableValues = function (files) {
        const values = {};
        Object.keys(files).forEach(key => {
            values[`$file.${key}`] = files[key];
        });

        return values;
    };

    self.truncate = function (str, maxLength, ellipsis = '...') {
        if (str.length > maxLength) {
            return str.substr(0, maxLength - ellipsis.length) + ellipsis;
        } else {
            return str;
        }
    };
})();
