'use strict';

const through = require('through2');


module.exports = function () {
    const names = [];

    const stream = through.obj(function (file, enc, cb) {
        names.push(file.relative.replace(/\\/g, '/'));
        cb(null, file);
    });

    stream.get = function () {
        return names;
    };

    return stream;
};
