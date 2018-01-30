/* eslint-disable no-console */

'use strict';

const Server = require('../lib/server');
const server = new Server();

server.start().then(() => {
    console.log(`RESTer dev server running at ${server.url}`);
});
