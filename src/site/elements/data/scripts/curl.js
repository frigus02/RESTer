function escape(str) {
    if (/[\s'$\\]/.test(str)) {
        return "'" + str.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
    } else {
        return str;
    }
}

/**
 * Generate a curl command for the given request object.
 * @param {Object} request - The request object.
 * @param {String} request.method - The HTTP method like GET or POST.
 * @param {String} request.url - The url.
 * @param {Array} request.headers - The headers. Each header is an object with
 * the properties `name` and `value`.
 * @param {String} request.body - The body.
 * @returns {String} The curl command.
 */
export function generateCommand(request) {
    let command = 'curl';

    if (request.method && request.method.toUpperCase() !== 'GET') {
        command += ` -X ${escape(request.method)}`;
    }

    if (request.url) {
        command += ` ${escape(request.url)}`;
    }

    for (const header of request.headers) {
        command += ` \\\n    -H ${escape(`${header.name}: ${header.value}`)}`;
    }

    if (request.body) {
        command += ` \\\n    -d ${escape(request.body)}`;
    }

    return command;
}
