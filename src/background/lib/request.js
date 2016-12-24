(function () {

    window.rester = window.rester || {};
    rester.request = {};


    function generateFormData(body, serverVariables) {
        const rawData = decodeQueryString(body),
              variableValues = serverVariables.values,
              formData = new FormData();

        for (let key in rawData) {
            if (rawData.hasOwnProperty(key)) {
                const value = rawData[key],
                      fileMatch = /^\[(\$file\.[^}]*)\]$/gi.exec(value);

                if (fileMatch) {
                    const file = variableValues[fileMatch[1]];
                    formData.append(key, readBase64CustomObjectAsBlob(file), file.name);
                } else {
                    formData.append(key, value);
                }
            }
        }

        return formData;
    }

    function decodeQueryString(str) {
        return str.split('&').reduce((params, currentParam) => {
            const keyValue = currentParam.split('=');
            params[keyValue[0]] = decodeURIComponent(keyValue[1]);
            return params;
        }, {});
    }

    function readBase64CustomObjectAsBlob(obj) {
        const bytes = base64js.toByteArray(obj.data);

        return new Blob([bytes], {
            type: obj.type
        });
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
    rester.request.send = function (request) {
        return new Promise(function (resolve, reject) {
            try {
                const xhr = new XMLHttpRequest({
                    mozAnon: true,
                    mozSystem: true
                });
                let timeStart;

                xhr.onabort = function () {
                    reject('Request cancelled.');
                };

                xhr.onerror = function () {
                    reject('Could not connect to server.');
                };

                xhr.ontimeout = function () {
                    reject('Requested timed out.');
                };

                xhr.onloadstart = function () {
                    timeStart = new Date();
                };

                xhr.onload = function () {
                    const timeEnd = new Date();
                    const headers = xhr.getAllResponseHeaders()
                        .split('\n')
                        .filter(rawHeader => rawHeader.indexOf(':') > 0)
                        .map(rawHeader => {
                            let name = rawHeader.substring(0, rawHeader.indexOf(':')),
                                value = xhr.getResponseHeader(name);
                            return {
                                name,
                                value
                            };
                        });

                    resolve({
                        status: xhr.status,
                        statusText: xhr.statusText,
                        headers: headers,
                        body: xhr.responseText,
                        timeStart: timeStart,
                        timeEnd: timeEnd
                    });
                };

                xhr.open(request.method, request.url, true);

                // Remove default headers.
                if (request.stripDefaultHeaders) {
                    xhr.setRequestHeader('Accept', '');
                    xhr.setRequestHeader('Accept-Encoding', '');
                    xhr.setRequestHeader('Accept-Language', '');
                    xhr.setRequestHeader('User-Agent', '');
                    xhr.setRequestHeader('If-None-Match', '');
                }

                // Special handling for multipart requests.
                const contentTypeIndex = request.headers.findIndex(h => h.name.toLowerCase() === 'content-type'),
                      contentType = request.headers[contentTypeIndex];
                if (contentType && contentType.value === 'multipart/form-data') {
                    request.headers.splice(contentTypeIndex, 1);
                    request.body = generateFormData(request.body, request.serverVariables);
                }

                for (let header of request.headers) {
                    if (header && header.name && header.value) {
                        xhr.setRequestHeader(header.name, header.value);
                    }
                }

                xhr.send(request.body);
            } catch (e) {
                reject('Could not set up XHR: ' + e.message);
            }
        });
    };

})();
