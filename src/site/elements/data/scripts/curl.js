// Credits to @xxorax for the shellescape function:
// Source: https://github.com/xxorax/node-shell-escape/blob/ebdb90e58050d74dbda9b8177f7de11cbb355d94/shell-escape.js
// License: MIT
function shellescape(s) {
    if (/[^A-Za-z0-9_/:=.-]/.test(s)) {
        s = "'" + s.replace(/'/g, "'\\''") + "'";
        s = s
            .replace(/^'+/g, "'") // deduplicate single-quotes at the beginning
            .replace(/\\'''/g, "\\'"); // remove non-escaped single-quotes if they are enclosed between 2 escaped
    }

    return s;
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
        command += ` -X ${shellescape(request.method)}`;
    }

    if (request.url) {
        command += ` ${shellescape(request.url)}`;
    }

    for (const header of request.headers) {
        command += ` \\\n    -H ${shellescape(
            `${header.name}: ${header.value}`,
        )}`;
    }

    if (request.body) {
        command += ` \\\n    -d ${shellescape(request.body)}`;
    }

    return command;
}
