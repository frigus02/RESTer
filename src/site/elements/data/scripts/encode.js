function appendSearchParams(searchParams, params) {
    for (const key in params) {
        if (Object.prototype.hasOwnProperty.call(params, key)) {
            const values = Array.isArray(params[key])
                ? params[key]
                : [params[key]];
            for (const value of values) {
                searchParams.append(key, value);
            }
        }
    }
}

export function encodeQueryString(params) {
    const searchParams = new URLSearchParams();
    appendSearchParams(searchParams, params);

    return searchParams.toString();
}

export function decodeQueryString(str) {
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
}

export function generateUri(base, params) {
    const url = new URL(base);
    appendSearchParams(url.searchParams, params);

    return url.toString();
}

export function encodeFormValue(value) {
    const encoded = encodeURIComponent(value);

    // The characters {, } and $ are required for variables to work correctly.
    return encoded.replace(/%(?:7B|7D|24)/g, unescape);
}

export function mapFilesToVariableValues(files) {
    const values = {};
    Object.keys(files).forEach((key) => {
        values[`$file.${key}`] = files[key];
    });

    return values;
}

export function truncate(str, maxLength, ellipsis = '…') {
    if (str.length > maxLength) {
        return str.substr(0, maxLength - ellipsis.length) + ellipsis;
    } else {
        return str;
    }
}
