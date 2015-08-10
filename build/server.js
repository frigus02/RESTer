var connect = require('connect');
var serveStatic = require('serve-static');
connect().use(serveStatic('data/site')).listen(8080);

console.log('Server runs at http://127.0.0.1:8080');
