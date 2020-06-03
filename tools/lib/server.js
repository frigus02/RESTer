'use strict';

const http = require('http');
const { randomLengthLoremIpsum } = require('./lorem-ipsum');

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
    return new Promise((resolve) => {
        let body = '';
        req.on('data', (data) => {
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
            ...formatHeaders(req.rawHeaders),
        ];
        if (req.method !== 'GET' && req.method !== 'HEAD') {
            lines.push('', await readBody(req));
        }

        res.end(lines.join('\r\n'));
    } else if (req.url === '/redirect') {
        res.statusCode = 302;
        res.setHeader('Location', '/echo');
        res.end('Found /echo');
    } else if (req.url === '/redirect?how=307') {
        res.statusCode = 307;
        res.setHeader('Location', '/echo');
        res.end('Temporary redirect /echo');
    } else if (req.url === '/large') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');

        const count = 50000;
        const entries = [];
        for (let i = 0; i < count; i++) {
            entries.push({
                title: `Item ${String(i).padStart(5, '0')}`,
                body: randomLengthLoremIpsum(),
                image: `https://cataas.com/cat/says/${Math.ceil(
                    Math.random() * count
                )}`,
            });
        }

        res.end(JSON.stringify(entries));
    } else if (req.url === '/basic-auth') {
        const auth = req.headers.authorization || '';
        const [scheme, token] = auth.split(/\s+/);
        if (scheme && token && scheme.toLowerCase() === 'basic') {
            const decoded = Buffer.from(token, 'base64').toString();
            const [user, pass] = decoded.split(':');
            if (user === 'foo' && pass === 'bar') {
                res.statusCode = 200;
                res.end('Success 👌');
                return;
            }
        }

        res.statusCode = 401;
        res.setHeader('WWW-Authenticate', 'Basic realm="RESTer Test Server"');
        res.end();
    } else if (req.url === '/basic-auth?logout') {
        res.statusCode = 401;
        res.setHeader('WWW-Authenticate', 'Basic realm="RESTer Test Server"');
        res.end();
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
        return new Promise((resolve, reject) => {
            this.server.once('error', reject);
            this.server.listen(port, hostname, () => {
                this.url = `http://${hostname}:${port}`;
                resolve();
            });
        });
    }

    stop() {
        return new Promise((resolve) => {
            this.server.close(() => resolve());
        });
    }
}

module.exports = Server;
