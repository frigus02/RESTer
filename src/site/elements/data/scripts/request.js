import { decodeQueryString } from './encode.js';
import { downloadBlob } from '../../../../shared/download-blob.js';

const defaultRequestHeaders = [
    "accept",
    "accept-encoding",
    "accept-language",
    "cache-control",
    "cookie",
    "origin",
    "pragma",
    "user-agent",
];

async function requestDeclarativeNetRequestPermission() {
    const requiredPermissions = {
        permissions: ['declarativeNetRequest', 'declarativeNetRequestWithHostAccess'],
    };

    // TODO: Doesn't seem to work with optional_permissions
    const granted = await chrome.permissions.request(requiredPermissions);
    if (!granted) {
        throw new Error('declarativeNetRequestWithHostAccess permission not granted');
    }
}

async function getCurrentTabId() {
    const tab = await chrome.tabs.getCurrent();
    return tab.id;
}

let headerInterceptorPromise;
export function ensureHeaderInterceptor() {
    if (!headerInterceptorPromise) {
        headerInterceptorPromise = (async function() {
            try {
                await requestDeclarativeNetRequestPermission();
                // TODO: Header interceptor needs different implementation
                // using chrome.declarativeNetRequest.updateSessionRules();
                // Features:
                // - Command "requestid"
                //   Used to read the original resonse statusCode, statusText
                //   and headers. Not sure if that can be implemented with
                //   declarativeNetRequest.
                // - Command "stripdefaultheaders"
                //   Currently uses an allowlist for default headers (host,
                //   content-length, content-type). Now needs to be done using
                //   a deny list passed to updateSessionRules() before making
                //   the request.
                // - Always append response header 'timing-allow-origin: *',
                //   which allows RESTer to read request timing information.
                // - Always append response header
                //   'access-control-expose-headers'. Not sure why this is
                //   necessary.
                // - Only apply to current tab and xmlhttprequest
                return await getCurrentTabId();
            } catch (e) {
                console.warn(
                    'RESTer could not install the header interceptor. ' +
                    'Certain features like setting cookies or the ' +
                    '"Clean Request" mode will not work as expected. ' +
                    'Reason: ' +
                    e.message
                );
            }
        })();
    }

    return headerInterceptorPromise;
}

function generateFormData(body, tempVariables) {
    const rawData = decodeQueryString(body);
    const variableValues = tempVariables.values;
    const formData = new FormData();

    for (let key in rawData) {
        if (Object.prototype.hasOwnProperty.call(rawData, key)) {
            const values = Array.isArray(rawData[key])
                ? rawData[key]
                : [rawData[key]];
            for (let value of values) {
                const fileMatch = /^\[(\$file\.[^}]*)\]$/gi.exec(value);

                if (fileMatch) {
                    const file = variableValues[fileMatch[1]];
                    formData.append(key, file, file.name);
                } else {
                    formData.append(key, value);
                }
            }
        }
    }

    return formData;
}

export function getFilenameFromContentDispositionHeader(disposition) {
    const utf8FilenameRegex = /filename\*=UTF-8''([\w%\-.]+)(?:; ?|$)/i;
    const asciiFilenameRegex = /filename=(["']?)(.*?[^\\])\1(?:; ?|$)/i;

    let fileName = null;
    if (utf8FilenameRegex.test(disposition)) {
        fileName = decodeURIComponent(utf8FilenameRegex.exec(disposition)[1]);
    } else {
        // Prevent ReDos attacks by anchoring the ascii regex to string start
        // and slicing off everything before 'filename='
        const filenameStart = disposition.toLowerCase().indexOf('filename=');
        if (filenameStart >= 0) {
            const partialDisposition = disposition.slice(filenameStart);
            const matches = asciiFilenameRegex.exec(partialDisposition);
            if (matches !== null && matches[2]) {
                fileName = matches[2];
            }
        }
    }

    if (fileName !== null) {
        // Sanitize filename for illegal characters
        const illegalRe = /[/?<>\\:*|":]/g;
        const controlRe = /[\x00-\x1f\x80-\x9f]/g;
        const reservedRe = /^\.+/g;
        const windowsReservedRe =
            /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;
        fileName = fileName
            .replace(illegalRe, '')
            .replace(controlRe, '')
            .replace(reservedRe, '')
            .replace(windowsReservedRe, '');
    }

    return fileName;
}

/**
 * Executes the specified HTTP request.
 * @param {Object} request - The request object.
 * @param {String} request.method - The HTTP method like GET or POST.
 * @param {String} request.url - The url.
 * @param {Boolean} request.stripDefaultHeaders - When true, will try to send a
 * clean request. This means stripping all default headers the browser would
 * normally send to the server like `Accept` or `User-Agent`. It also means not
 * following sending credentials or following redirects.
 * @param {Array} request.headers - The headers. Each header is an object with
 * the properties `name` and `value`.
 * @param {String} request.body - The body.
 * @param {Object} request.tempVariables - Additional variables, which might
 * be compiled into the request. This is currently used to append files to
 * formdata requests.
 * @param {AbortSignal} request.signal - An optional abort signal. When triggered,
 * the request and response is aborted and the promise returned by this function
 * is rejected with a DOMException named 'AbortError'.
 * @returns {Promise.<Object>} A promise which gets resolved, when the request
 * was successfully saved and returns the request response.
 */
export async function send(request) {
    const tabId = await ensureHeaderInterceptor();
    const headersIntercepted = tabId != null;

    // Special handling for multipart requests.
    const contentTypeIndex = request.headers.findIndex(
        (h) => h.name.toLowerCase() === 'content-type'
    );
    const contentType = request.headers[contentTypeIndex];
    let requestHeaders = request.headers;
    let requestBody = request.body;
    if (contentType && contentType.value === 'multipart/form-data') {
        requestHeaders = request.headers.filter((h) => h !== contentType);
        requestBody = generateFormData(request.body, request.tempVariables);
    }

    // Create fetch request options.
    const headers = new Headers();
    if (headersIntercepted) {
        const requestHeaders = [];
        if (request.stripDefaultHeaders) {
            for (const headerName of defaultRequestHeaders) {
                requestHeaders.push({
                    header: headerName,
                    operation: "remove",
                });
            }
        }
        for (const header of requestHeaders) {
            if (header && header.name && header.value) {
                requestHeaders.push({
                    header: header.name,
                    operation: "set",
                    value: header.value,
                });
            }
        }

        const responseHeaders = [{
            // TODO: how do read the original value of this header?
            header: "timing-allow-origin",
            operation: "set",
            value: "*",
        }];
        const addRules = [{
            action: {
                type: "modifyHeaders",
                requestHeaders: requestHeaders.length > 0 ? requestHeaders : undefined,
                responseHeaders,
            },
            condition: {
                resourceTypes: ["xmlhttprequest"],
                tabIds: [tabId],
            },
            id: tabId,
        }];
        const removeRuleIds = [tabId];
        await chrome.declarativeNetRequest.updateSessionRules({
            addRules,
            removeRuleIds,
        });
    } else {
        for (const header of requestHeaders) {
            if (header && header.name && header.value) {
                headers.append(header.name, header.value);
            }
        }
    }

    const init = {
        method: request.method,
        headers,
        mode: 'cors',
        credentials: request.stripDefaultHeaders ? 'omit' : 'include',
        cache: 'no-store',
        redirect: request.stripDefaultHeaders ? 'manual' : 'follow',
        signal: request.signal,
    };

    if (
        request.method.toLowerCase() !== 'head' &&
        request.method.toLowerCase() !== 'get'
    ) {
        init.body = requestBody;
    }

    // Send request.
    const response = {
        timeStart: new Date(),
    };

    const fetchResponse = await fetch(request.url, init);
    response.redirected = fetchResponse.redirected;

    response.status = fetchResponse.status;
    response.statusText = fetchResponse.statusText;
    response.headers = Array.from(fetchResponse.headers.entries()).map(
        ([name, value]) => ({ name, value })
    );

    // Check if the responce is binary file content. If so, open file download.
    const disposition = response.headers.find(
        (x) => x.name.toLowerCase() === 'content-disposition'
    );

    if (disposition && disposition.value.startsWith('attachment')) {
        const fetchBody = await fetchResponse.blob();
        response.timeEnd = new Date();
        response.body =
            'body not available; it has been saved as a file because of the content-disposition header';
        const filename = getFilenameFromContentDispositionHeader(
            disposition.value
        );
        downloadBlob(fetchBody, { filename, saveAs: true });
    } else {
        const fetchBody = await fetchResponse.text();
        response.timeEnd = new Date();
        response.body = fetchBody;
    }

    const matchingTimings = performance.getEntries({
        name: request.url,
        entryType: 'resource',
    });
    if (matchingTimings.length > 0) {
        response.timing = matchingTimings[matchingTimings.length - 1].toJSON();
    }

    return response;
}
