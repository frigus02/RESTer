'use strict';

const copyBower = require('./lib/copy-bower'),
      fillAbout = require('./lib/fill-about');

copyBower()
    .then(fillAbout)
    .catch(console.error);
