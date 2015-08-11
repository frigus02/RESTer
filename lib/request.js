const Request = require('sdk/request').Request;
const a = require('sdk/net/xhr');

exports.send = function (request) {
    return new Promise(function (resolve, reject) {
        Request({
            url: request.url,
            onComplete: function (response) {
                resolve({
                    status: response.status,
                    statusText: response.statusText,
                    headers: response.headers,
                    body: response.text
                });
            }
        }).get();
    });
};
