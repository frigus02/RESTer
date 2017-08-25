/* eslint-disable no-console */

'use strict';

/**
 * Removes the symlink from <project_root>/src/site/bower_components
 * to <project_root>/bower_components.
 */

const fs = require('fs');
const { promisify } = require('util');
const unlink = promisify(fs.unlink);


async function main() {
    console.log('Removing symlink bower_components -> src/site/bower_components...');
    await unlink('bower_components');
}

main().catch(err => console.error(err.stack));
