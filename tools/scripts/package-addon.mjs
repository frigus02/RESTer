/* eslint-disable no-console */

'use strict';

import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';

import createPackage from '../lib/create-package.js';

async function main() {
    const browser = process.argv[2];

    const packageJson = JSON.parse(
        await readFile(new URL('../../package.json', import.meta.url))
    );
    const srcDir = fileURLToPath(new URL('../../.build', import.meta.url));
    const destFile = fileURLToPath(
        new URL(
            `../../.package/${browser}-${packageJson.version}.zip`,
            import.meta.url
        )
    );

    await createPackage({ browser, srcDir, destFile });
    console.log(`Created file ${destFile}.`);
}

main().catch((err) => console.error(err.stack));
