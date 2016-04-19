'use strict';

const XMLHttpRequest = require('sdk/net/xhr').XMLHttpRequest;

/**
 * Executes the specified HTTP request.
 * @param {Object} request - The request object.
 * @param {String} request.method - The HTTP method like GET or POST.
 * @param {String} request.url - The url.
 * @param {Array} request.headers - The headers. Each header is an object with
 * the properties `name` and `value`.
 * @param {String} request.body - The body.
 * @returns {Promise.<Object>} A promise which gets resolved, when the request
 * was successfully saved and returns the request response.
 */
exports.send = function (request) {
    return new Promise(function (resolve, reject) {
        try {
            let xhr = new XMLHttpRequest({
                mozAnon: true,
                mozSystem: true
            });

            xhr.onerror = function () {
                reject('Could not connect to server.');
            };

            xhr.ontimeout = function () {
                reject('Requested timed out.');
            };

            xhr.onload = function () {
                let headers = xhr.getAllResponseHeaders()
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
                    body: xhr.responseText
                });
            };

            xhr.open(request.method, request.url, true);

            // Remove default headers.
            xhr.setRequestHeader('Accept', '');
            xhr.setRequestHeader('Accept-Encoding', '');
            xhr.setRequestHeader('Accept-Language', '');
            xhr.setRequestHeader('User-Agent', '');
            xhr.setRequestHeader('If-None-Match', '');

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
