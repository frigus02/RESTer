'use strict';

const http = require('http');

const hostname = '127.0.0.1';
const port = 7373;

function formatHeaders(rawHeaders) {
    const lines = [];
    for (let i = 0; i < rawHeaders.length; i += 2) {
        lines.push(`${rawHeaders[i]}: ${rawHeaders[i + 1]}`);
    }

    return lines;
}

function readBody(req) {
    return new Promise(resolve => {
        let body = '';
        req.on('data', data => {
            body += data;
        });
        req.on('end', () => {
            resolve(body);
        });
    });
}

async function middleware(req, res) {
    if (req.url === '/') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');

        res.end(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>RESTer Test Server</title>
            </head>
            <body>
                <h1>RESTer Test Server</h1>
            </body>
            </html>
        `);
    } else if (req.url === '/echo') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('TeSt-WeIrD-case', 'OoookAayyy');

        const lines = [
            `${req.method} ${req.url} HTTP/${req.httpVersion}`,
            ...formatHeaders(req.rawHeaders)
        ];
        if (req.method !== 'GET' && req.method !== 'HEAD') {
            lines.push('', await readBody(req));
        }

        res.end(lines.join('\r\n'));
    } else {
        res.statusCode = 404;
        res.end('Not Found\n');
    }
}

class Server {
    constructor() {
        this.server = http.createServer(middleware);
    }

    start() {
        return new Promise(resolve => {
            this.server.listen(port, hostname, () => {
                this.url = `http://${hostname}:${port}`;
                resolve();
            });
        });
    }

    stop() {
        return new Promise(resolve => {
            this.server.close(() => resolve());
        });
    }
}

module.exports = Server;
