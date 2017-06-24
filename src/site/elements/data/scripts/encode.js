(function () {
    'use strict';

    const self = RESTer.register('encode');

    self.encodeQueryString = function (params) {
        const parts = [];
        for (let key in params) {
            if (params.hasOwnProperty(key)) {
                const encodedKey = encodeURIComponent(key);
                const values = Array.isArray(params[key]) ? params[key] : [params[key]];

                for (let value of values) {
                    const encodedValue = encodeURIComponent(value);
                    parts.push(`${encodedKey}=${encodedValue}`);
                }
            }
        }

        return parts.join('&');
    };

    self.decodeQueryString = function (str) {
        const params = {};
        const parts = str.split('&');

        for (let part of parts) {
            const keyValue = part.split('=');
            const key = decodeURIComponent(keyValue[0]);
            const value = decodeURIComponent(keyValue[1]);

            if (!params[key]) {
                params[key] = value;
            } else if (Array.isArray(params[key])) {
                params[key].push(value);
            } else {
                params[key] = [params[key], value];
            }
        }

        return params;
    };

    self.generateUri = function (base, params) {
        return base + '?' + self.encodeQueryString(params);
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
