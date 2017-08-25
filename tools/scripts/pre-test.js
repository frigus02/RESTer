/* eslint-disable no-console */

'use strict';

/**
 * 1. Creates a symlink from <project_root>/src/site/bower_components
 *    to <project_root>/bower_components, because WCT requires this.
 * 2. Patches the WCT local selenium config to use newer selenium
 *    drivers. The old ones don't work with newer versions of Firefox.
 */

const fs = require('fs');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const symlink = promisify(fs.symlink);
const writeFile = promisify(fs.writeFile);


async function createBowerComponentsSymlink() {
    try {
        await symlink('src/site/bower_components', 'bower_components', 'junction');
    } catch (err) {
        if (err.code !== 'EEXIST') {
            throw err;
        }
    }
}

async function patchWctLocalSeleniumConfig() {
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

    const content = await readFile(configPath, 'utf-8');
    const config = JSON.parse(content);
    config['selenium-overrides'] = goodConfig;

    const newContent = JSON.stringify(config, null, 2);
    await writeFile(configPath, newContent);
}

async function main() {
    console.log('Creating symlink bower_components -> src/site/bower_components...');
    await createBowerComponentsSymlink();

    console.log('Patching WCT selenium config...');
    await patchWctLocalSeleniumConfig();
}

main().catch(err => console.error(err.stack));
