/* eslint-disable no-console */

'use strict';

const http = require('http');

const hostname = '127.0.0.1';
const port = 7373;

function stripWhiteSpace(strings, ...values) {
    const raw = String.raw(strings, ...values);
    const lines = raw.split('\n').map(line => line.replace(/^\s*/g, ''));
    if (lines[0].length === 0) {
        lines.splice(0, 1);
    }

    return lines.join('\n');
}

function formatHeaders(req) {
    return req.rawHeaders.reduce(
        (prev, current, index) =>
            index % 2 === 0
                ? prev + '\n' + current
                : prev + ': ' + current,
        '');
}

function readBody(req) {
    return new Promise(resolve => {
        if (req.method !== 'GET' && req.method !== 'HEAD') {
            let body = '';
            req.on('data', data => {
                body += data;
            });
            req.on('end', () => {
                resolve('\n' + body);
            });
        } else {
            resolve('');
        }
    });
}

const server = http.createServer(async (req, res) => {
    switch (req.url) {
        case '/echo':
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain');
            res.setHeader('TeSt-WeIrD-case', 'OoookAayyy');
            res.end(stripWhiteSpace`
                HTTP/1.1 ${req.method} ${req.url}
                ${formatHeaders(req)}
                ${await readBody(req)}`);
            break;
        default:
            res.statusCode = 404;
            res.end('Not Found\n');
    }
});

server.listen(port, hostname, () => {
    console.log(`RESTer dev server running at http://${hostname}:${port}/`);
});
