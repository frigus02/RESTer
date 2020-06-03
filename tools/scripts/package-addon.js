/* eslint-disable no-console */

'use strict';

const path = require('path');

const { version } = require('../../package.json');
const createPackage = require('../lib/create-package');

async function main() {
    const browser = process.argv[2];
    const srcDir = path.resolve(__dirname, '../../.build');
    const destFile = path.resolve(
        __dirname,
        `../../.package/${browser}-${version}.zip`
    );

    await createPackage({ browser, srcDir, destFile });
    console.log(`Created file ${destFile}.`);
}

main().catch((err) => console.error(err.stack));
