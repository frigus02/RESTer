'use strict';

const fs = require('fs');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const symlink = promisify(fs.symlink);
const writeFile = promisify(fs.writeFile);


/**
 * Creates a symlink from <project_root>/src/site/bower_components
 * to <project_root>/bower_components, because WCT requires this.
 *
 * @return {Promise}
 */
function prepareForWct() {
    return createBowerComponentsSymlink().then(patchWctLocalSeleniumConfig);
}

function createBowerComponentsSymlink() {
    return symlink('src/site/bower_components', 'bower_components', 'junction').catch(err => {
        if (err.code !== 'EEXIST') {
            throw err;
        }
    });
}

function patchWctLocalSeleniumConfig() {
    const configPath = 'node_modules/wct-local/package.json';
    const goodConfig = {
        version: '3.4.0',
        drivers: {
            firefox: {
                version: '0.18.0'
            },
            chrome: {}
        }
    };

    return readFile(configPath, 'utf-8').then(content => {
        const config = JSON.parse(content);
        config['selenium-overrides'] = goodConfig;

        const newContent = JSON.stringify(config, null, 2);

        return writeFile(configPath, newContent);
    });
}

module.exports = prepareForWct;
