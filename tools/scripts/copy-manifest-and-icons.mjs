/* eslint-disable no-console */

'use strict';

import { fileURLToPath } from 'url';
import * as path from 'path';
import { symlink, mkdir, lstat } from 'fs/promises';

import copyManifestAndIcons from '../lib/copy-manifest-and-icons.js';

async function linkDir(destBaseDir, dir) {
    const chromeDir = path.join(destBaseDir, 'chrome', dir);
	let exists;
    try {
		const stat = await lstat(chromeDir);
		exists = stat.isSymbolicLink();
	} catch (e) {
		exists = false;
	}

    if (!exists) {
        await mkdir(path.join(destBaseDir, 'firefox', dir), {
            recursive: true,
        });
        await symlink(
            path.join(destBaseDir, 'firefox', dir),
            chromeDir,
            'junction'
        );
    }
}

async function main() {
    const mode = process.argv[2];

    const srcDir = fileURLToPath(new URL('../../src', import.meta.url));
    const destBaseDir = fileURLToPath(new URL(`../../build`, import.meta.url));

    await copyManifestAndIcons({
        browser: 'firefox',
        srcDir,
        destDir: path.join(destBaseDir, 'firefox'),
        mode,
    });
    await copyManifestAndIcons({
        browser: 'chrome',
        srcDir,
        destDir: path.join(destBaseDir, 'chrome'),
        mode,
    });

    await linkDir(destBaseDir, 'background');
    await linkDir(destBaseDir, 'site');
}

main().catch((err) => console.error(err.stack));
