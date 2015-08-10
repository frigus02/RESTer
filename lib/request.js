const Request = require('sdk/request').Request;
const a = require('sdk/net/xhr');

exports.load = function (request) {
    return new Promise(function (resolve, reject) {
        Request({
            url: request.url,
            onComplete: function (response) {
                resolve({
                    text: response.text,
                    json: response.json,
                    status: response.status,
                    statusText: response.statusText,
                    headers: response.headers
                });
            }
        }).get();
    });
};
