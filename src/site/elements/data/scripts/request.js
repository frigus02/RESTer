(function () {
    'use strict';

    const self = RESTer.register('request');

    const headerPrefix = `x-rester-49ba6c3c4d3e4c069630b903fb211cf8-`;
    const headerCommand = `x-rester-command-49ba6c3c4d3e4c069630b903fb211cf8`;
    const defaultHeaders = [
        'accept',
        'accept-charset',
        'accept-language',
        'content-type',
        'cookie',
        'if-none-match',
        'origin',
        'user-agent'
    ];

    chrome.tabs.getCurrent(tab => {
        setupHeaderInterceptor(tab.id);
    });

    function setupHeaderInterceptor(currentTabId) {
        function onBeforeSendHeaders(details) {
            if (details.tabId !== currentTabId) {
                return;
            }

            const newHeaders = [];
            const indexesToRemove = [];
            const removeDefaultHeaders = details.requestHeaders.some(h => h.name.toLowerCase() === headerCommand && h.value === 'stripdefaultheaders');
            for (let i = 0; i < details.requestHeaders.length; i++) {
                const header = details.requestHeaders[i];
                const lowerCaseName = header.name.toLowerCase();
                if (lowerCaseName.startsWith(headerPrefix)) {
                    newHeaders.push({
                        name: header.name.substr(headerPrefix.length),
                        value: header.value
                    });
                    indexesToRemove.push(i);
                } else if (lowerCaseName === headerCommand) {
                    indexesToRemove.push(i);
                } else if (removeDefaultHeaders && defaultHeaders.includes(lowerCaseName) && !(lowerCaseName === 'content-type' && header.value.startsWith('multipart/form-data'))) {
                    indexesToRemove.push(i);
                }
            }

            indexesToRemove.reverse();
            for (let index of indexesToRemove) {
                details.requestHeaders.splice(index, 1);
            }

            for (let header of newHeaders) {
                details.requestHeaders.push(header);
            }

            return {
                requestHeaders: details.requestHeaders
            };
        }

        chrome.webRequest.onBeforeSendHeaders.addListener(onBeforeSendHeaders, {
            urls: ['<all_urls>'],
            types: ['xmlhttprequest'],
            tabId: currentTabId
        }, ['blocking', 'requestHeaders']);

        function onHeadersReceived(details) {
            if (details.tabId !== currentTabId) {
                return;
            }

            const newHeaders = [
                {
                    name: 'timing-allow-origin',
                    value: '*'
                },
                {
                    name: 'access-control-expose-headers',
                    value: details.responseHeaders.map(h => h.name).join(', ')
                }
            ];
            const indexesToRemove = [];
            for (let i = 0; i < details.responseHeaders.length; i++) {
                const header = details.responseHeaders[i];
                const lowerCaseName = header.name.toLowerCase();
                if (lowerCaseName === 'timing-allow-origin' || lowerCaseName === 'access-control-expose-headers') {
                    newHeaders.push({
                        name: headerPrefix + header.name,
                        value: header.value
                    });
                    indexesToRemove.push(i);
                }
            }

            indexesToRemove.reverse();
            for (let index of indexesToRemove) {
                details.responseHeaders.splice(index, 1);
            }

            for (let header of newHeaders) {
                details.responseHeaders.push(header);
            }

            return {
                responseHeaders: details.responseHeaders
            };
        }

        chrome.webRequest.onHeadersReceived.addListener(onHeadersReceived, {
            urls: ['<all_urls>'],
            types: ['xmlhttprequest'],
            tabId: currentTabId
        }, ['blocking', 'responseHeaders']);
    }

    function generateFormData(body, tempVariables) {
        const rawData = RESTer.encode.decodeQueryString(body);
        const variableValues = tempVariables.values;
        const formData = new FormData();

        for (let key in rawData) {
            if (rawData.hasOwnProperty(key)) {
                const values = Array.isArray(rawData[key]) ? rawData[key] : [rawData[key]];
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


    /**
     * Executes the specified HTTP request.
     * @param {Object} request - The request object.
     * @param {String} request.method - The HTTP method like GET or POST.
     * @param {String} request.url - The url.
     * @param {Boolean} request.stripDefaultHeaders - When true, will try to strip
     * all default headers the browser would normally send to the server like
     * `Accept` or `User-Agent`.
     * @param {Array} request.headers - The headers. Each header is an object with
     * the properties `name` and `value`.
     * @param {String} request.body - The body.
     * @returns {Promise.<Object>} A promise which gets resolved, when the request
     * was successfully saved and returns the request response.
     */
    self.send = function (request) {
        // Special handling for multipart requests.
        const contentTypeIndex = request.headers.findIndex(h => h.name.toLowerCase() === 'content-type');
        const contentType = request.headers[contentTypeIndex];
        let requestHeaders = request.headers;
        let requestBody = request.body;
        if (contentType && contentType.value === 'multipart/form-data') {
            requestHeaders = request.headers.filter(h => h !== contentType);
            requestBody = generateFormData(request.body, request.tempVariables);
        }

        // Create fetch request options.
        const headers = new Headers();
        if (request.stripDefaultHeaders) {
            headers.append(headerCommand, 'stripdefaultheaders');
        }

        for (const header of requestHeaders) {
            if (header && header.name && header.value) {
                headers.append(headerPrefix + header.name, header.value);
            }
        }

        const init = {
            method: request.method,
            headers,
            mode: 'cors',
            credentials: 'omit',
            cache: 'no-store',
            redirect: 'manual'
        };

        if (request.method.toLowerCase() !== 'head' && request.method.toLowerCase() !== 'get') {
            init.body = requestBody;
        }

        // Send request.
        const response = {
            timeStart: new Date()
        };
        return fetch(request.url, init)
            .then(fetchResponse => {
                response.status = fetchResponse.status;
                response.statusText = fetchResponse.statusText;
                response.headers = [];

                for (const pair of fetchResponse.headers) {
                    if (pair[0] !== 'timing-allow-origin' && pair[0] !== 'access-control-expose-headers') {
                        let name = pair[0],
                            value = pair[1];

                        if (name.startsWith(headerPrefix)) {
                            name = name.substr(headerPrefix.length);
                        }

                        // Capitalize the first letter of each "-" separated word
                        // in the header name to make it easier to read.
                        name = name.split('-')
                            .map(part => part.charAt(0).toUpperCase() + part.substr(1))
                            .join('-');

                        response.headers.push({ name, value });
                    }
                }

                return fetchResponse.text();
            })
            .then(fetchBody => {
                response.timeEnd = new Date();
                response.body = fetchBody;

                const matchingTimings = performance.getEntries({
                    name: request.url,
                    entryType: 'resource'
                });
                if (matchingTimings.length > 0) {
                    response.timing = matchingTimings[matchingTimings.length - 1].toJSON();
                }

                return response;
            });
    };
})();
