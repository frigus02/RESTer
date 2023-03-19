// TODO: Missing features with declarativeNetRequest:
// - Read the original resonse statusCode, statusText and headers.
// - Read original timing-allow-origin response header.
// - Append response header 'access-control-expose-headers' for all responses
//   headers. Can't use '*' here because it's only a wildcard in requests
//   without credentials.
// - declarativeNetRequest doesn't seem to work with optional_permissions

import { generateFormData } from './encode.js';
import {
    mergeCookies,
    parseStatusLine,
    getFilenameFromContentDispositionHeader,
} from '../../../../shared/util.js';
import { downloadBlob } from '../../../../shared/download-blob.js';

const API = isFirefox() ? 'webRequest' : 'declarativeNetRequest';

const headerPrefix = `x-rester-49ba6c3c4d3e4c069630b903fb211cf8-`;
const headerCommandPrefix = `x-rester-command-49ba6c3c4d3e4c069630b903fb211cf8-`;
const requiredDefaultHeaders = {
    host: /.*/i,
    'content-length': /.*/i,
    'content-type': /^multipart\/form-data.*/i,
};

// Maps from browser requestId to RESTer requestId.
const requestIds = new Map();

// Maps from RESTer requestId to original response headers.
const originalResponses = new Map();

const defaultRequestHeaders = [
    'accept',
    'accept-encoding',
    'accept-language',
    'cache-control',
    'cookie',
    'origin',
    'pragma',
    'user-agent',
];

function isFirefox() {
    const manifest = chrome.runtime.getManifest();
    return manifest.browser_specific_settings?.gecko != null;
}

async function getCurrentTabId() {
    const tab = await chrome.tabs.getCurrent();
    return tab.id;
}

let headerInterceptorPromise;
export function ensureHeaderInterceptor() {
    if (!headerInterceptorPromise) {
        headerInterceptorPromise = (async function () {
            const requiredPermissions = {
                permissions: ['webRequest', 'webRequestBlocking'],
            };
            const granted = await chrome.permissions.request(
                requiredPermissions
            );
            if (!granted) {
                console.warn(
                    'RESTer could not install the header interceptor. ' +
                        'Certain features like setting cookies or the ' +
                        '"Clean Request" mode will not work as expected.'
                );
                return false;
            }

            setupHeaderInterceptor(await getCurrentTabId());
            return true;
        })();
    }

    return headerInterceptorPromise;
}

function setupHeaderInterceptor(currentTabId) {
    function onBeforeSendHeaders(details) {
        const commands = details.requestHeaders
            .filter((h) => h.name.toLowerCase().startsWith(headerCommandPrefix))
            .map((h) => ({
                name: h.name.substr(headerCommandPrefix.length),
                value: h.value,
            }));

        // Request ID
        const resterRequestId = commands.find(
            (c) => c.name === 'requestid'
        ).value;
        requestIds.set(details.requestId, resterRequestId);

        // Headers
        const removeDefaultHeaders = commands.some(
            (c) => c.name === 'stripdefaultheaders'
        );
        const newHeaders = [];
        const indexesToRemove = [];
        for (let i = 0; i < details.requestHeaders.length; i++) {
            const header = details.requestHeaders[i];
            const lowerCaseName = header.name.toLowerCase();
            if (lowerCaseName.startsWith(headerPrefix)) {
                newHeaders.push(JSON.parse(header.value));
                indexesToRemove.push(i);
            } else if (lowerCaseName.startsWith(headerCommandPrefix)) {
                indexesToRemove.push(i);
            } else if (
                removeDefaultHeaders &&
                !(
                    requiredDefaultHeaders[lowerCaseName] &&
                    requiredDefaultHeaders[lowerCaseName].test(header.value)
                )
            ) {
                indexesToRemove.push(i);
            }
        }

        if (!removeDefaultHeaders) {
            // Merge browser and manual cookie headers
            const cookieHeaderIndex = details.requestHeaders.findIndex(
                (h) => h.name.toLowerCase() === 'cookie'
            );
            const customCookieHeaderIndex = newHeaders.findIndex(
                (h) => h.name.toLowerCase() === 'cookie'
            );
            if (cookieHeaderIndex > -1 && customCookieHeaderIndex > -1) {
                const cookieHeader = details.requestHeaders[cookieHeaderIndex];
                const customCookieHeader = newHeaders[customCookieHeaderIndex];

                indexesToRemove.push(cookieHeaderIndex);
                customCookieHeader.value = mergeCookies(
                    cookieHeader.value,
                    customCookieHeader.value
                );
            }

            // Remove overridden browser headers
            for (let i = 0; i < details.requestHeaders.length; i++) {
                const isOverridden = newHeaders.some(
                    (header) =>
                        header.name.toLowerCase() ===
                        details.requestHeaders[i].name.toLowerCase()
                );
                if (isOverridden && !indexesToRemove.includes(i)) {
                    indexesToRemove.push(i);
                }
            }
        }

        indexesToRemove.sort((a, b) => b - a);
        for (const index of indexesToRemove) {
            details.requestHeaders.splice(index, 1);
        }

        for (const header of newHeaders) {
            details.requestHeaders.push(header);
        }

        return {
            requestHeaders: details.requestHeaders,
        };
    }

    chrome.webRequest.onBeforeSendHeaders.addListener(
        onBeforeSendHeaders,
        {
            urls: ['<all_urls>'],
            types: ['xmlhttprequest'],
            tabId: currentTabId,
        },
        [
            'blocking',
            'requestHeaders',
            // Chrome requires "extraHeaders" from version 72, but adding this
            // unconditionally causes an error in Firefox.
            chrome.webRequest.OnBeforeSendHeadersOptions.EXTRA_HEADERS,
        ].filter((option) => !!option)
    );

    function onHeadersReceived(details) {
        const originalHeaders = [];
        const newHeaders = [
            {
                name: 'timing-allow-origin',
                value: '*',
            },
            {
                name: 'access-control-expose-headers',
                value: details.responseHeaders.map((h) => h.name).join(', '),
            },
        ];
        const indexesToRemove = [];
        for (let i = 0; i < details.responseHeaders.length; i++) {
            const header = details.responseHeaders[i];
            const lowerCaseName = header.name.toLowerCase();

            originalHeaders.push(header);

            if (
                lowerCaseName === 'timing-allow-origin' ||
                lowerCaseName === 'access-control-expose-headers'
            ) {
                indexesToRemove.push(i);
            }
        }

        const resterRequestId = requestIds.get(details.requestId);
        requestIds.delete(details.requestId);

        const statusLine = parseStatusLine(details.statusLine);
        originalResponses.set(resterRequestId, {
            status: statusLine.statusCode,
            statusText: statusLine.reasonPhrase,
            headers: originalHeaders,
        });

        indexesToRemove.reverse();
        for (let index of indexesToRemove) {
            details.responseHeaders.splice(index, 1);
        }

        for (let header of newHeaders) {
            details.responseHeaders.push(header);
        }

        return {
            responseHeaders: details.responseHeaders,
        };
    }

    chrome.webRequest.onHeadersReceived.addListener(
        onHeadersReceived,
        {
            urls: ['<all_urls>'],
            types: ['xmlhttprequest'],
            tabId: currentTabId,
        },
        [
            'blocking',
            'responseHeaders',
            // Chrome requires "extraHeaders" from version 72, but adding this
            // unconditionally causes an error in Firefox.
            chrome.webRequest.OnHeadersReceivedOptions.EXTRA_HEADERS,
        ].filter((option) => !!option)
    );
}

function setHeadersViaHeaderInterceptor(headers, stripDefaultHeaders) {
    const result = new Headers();
    const requestId = String(Math.random());
    result.append(headerCommandPrefix + 'requestid', requestId);
    if (stripDefaultHeaders) {
        result.append(headerCommandPrefix + 'stripdefaultheaders', 'true');
    }

    for (const header of headers) {
        if (header && header.name && header.value) {
            result.append(
                headerPrefix + header.name,
                JSON.stringify({ name: header.name, value: header.value })
            );
        }
    }

    return { headers: result, requestId };
}

async function setHeadersViaDeclarativeNetRequest(
    headers,
    stripDefaultHeaders
) {
    const tabId = await getCurrentTabId();
    const requestHeaders = [];
    if (stripDefaultHeaders) {
        for (const headerName of defaultRequestHeaders) {
            requestHeaders.push({
                header: headerName,
                operation: 'remove',
            });
        }
    }
    for (const header of headers) {
        if (header && header.name && header.value) {
            requestHeaders.push({
                header: header.name,
                operation: 'set',
                value: header.value,
            });
        }
    }

    const responseHeaders = [
        {
            header: 'timing-allow-origin',
            operation: 'set',
            value: '*',
        },
    ];
    const addRules = [
        {
            action: {
                type: 'modifyHeaders',
                requestHeaders:
                    requestHeaders.length > 0 ? requestHeaders : undefined,
                responseHeaders,
            },
            condition: {
                resourceTypes: ['xmlhttprequest'],
                tabIds: [tabId],
            },
            id: tabId,
        },
    ];
    const removeRuleIds = [tabId];
    await chrome.declarativeNetRequest.updateSessionRules({
        addRules,
        removeRuleIds,
    });
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
    const headersIntercepted =
        API === 'webRequest' && (await ensureHeaderInterceptor());

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
    let headers;
    let requestId;
    if (API === 'webRequest' && headersIntercepted) {
        const result = setHeadersViaHeaderInterceptor(
            requestHeaders,
            request.stripDefaultHeaders
        );
        headers = result.headers;
        requestId = result.requestId;
    } else if (API === 'declarativeNetRequest') {
        await setHeadersViaDeclarativeNetRequest(
            requestHeaders,
            request.stripDefaultHeaders
        );
        headers = new Headers();
    } else {
        headers = new Headers();
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

    if (API === 'webRequest' && headersIntercepted) {
        const originalResponse = originalResponses.get(requestId);
        originalResponses.delete(requestId);
        response.status = originalResponse.status;
        response.statusText = originalResponse.statusText;
        response.headers = [...originalResponse.headers];
    } else {
        response.status = fetchResponse.status;
        response.statusText = fetchResponse.statusText;
        response.headers = Array.from(fetchResponse.headers.entries()).map(
            ([name, value]) => ({ name, value })
        );
    }

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
