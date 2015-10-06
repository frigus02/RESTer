'use strict';

const connect = require('connect'),
      serveStatic = require('serve-static'),
      exec = require('child_process').exec;

connect().use(serveStatic('data/site')).listen(8080);
exec('start http://127.0.0.1:8080');

console.log('Server runs at http://127.0.0.1:8080');
