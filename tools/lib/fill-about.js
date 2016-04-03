'use strict';

const promiseDenodeify = require('./promise-denodeify'),
      fs = require('fs'),
      readFile = promiseDenodeify(fs.readFile),
      writeFile = promiseDenodeify(fs.writeFile),
      bowerJson = require('../../bower.json'),
      aboutFile = 'data/site/scripts/controllers/main.about.js';


module.exports = function () {
    let components = Object.keys(bowerJson.dependencies).map(name => ({
        name: name,
        version: bowerJson.dependencies[name]
    }));

    return readFile(aboutFile, 'utf-8').then(content => {
        content = content.replace(
            /(\/\*START\*\/)([\s\S]*?)(\/\*END\*\/)/gi,
            '$1' + JSON.stringify(components) + '$3');

        return writeFile(aboutFile, content);
    });
};
