import { createWriteStream } from 'fs';
import { readFile, mkdir } from 'fs/promises';
import * as path from 'path';

import { ZipArchive } from 'archiver';

const additionalManifestEntries = {
    firefox: {
        applications: {
            gecko: {
                id: 'rester@kuehle.me',
                strict_min_version: '63.0',
            },
        },
        icons: {
            48: 'images/icon48.png',
            96: 'images/icon96.png',
        },
        browser_action: {
            default_icon: {
                16: 'images/icon16.png',
                24: 'images/icon24.png',
                32: 'images/icon32.png',
            },
            theme_icons: [
                {
                    dark: 'images/icon16.png',
                    light: 'images/icon-light16.png',
                    size: 16,
                },
                {
                    dark: 'images/icon24.png',
                    light: 'images/icon-light24.png',
                    size: 24,
                },
                {
                    dark: 'images/icon32.png',
                    light: 'images/icon-light32.png',
                    size: 32,
                },
            ],
        },
    },
    chrome: {
        minimum_chrome_version: '67',
        icons: {
            48: 'images/icon48.png',
            128: 'images/icon128.png',
        },
        browser_action: {
            default_icon: {
                16: 'images/icon16.png',
                24: 'images/icon24.png',
                32: 'images/icon32.png',
            },
        },
    },
};

const usedImages = {
    firefox: [
        'images/icon{16,24,32,48,96}.png',
        'images/icon-light{16,24,32,48,96}.png',
    ],
    chrome: ['images/icon{16,24,32,48,128}.png'],
};

function enhanceManifestJson(packageJson, manifestJson, browser) {
    const { version } = JSON.parse(packageJson);
    const manifest = JSON.parse(manifestJson);

    // Add additional keys.
    Object.assign(manifest, additionalManifestEntries[browser]);

    // Validate version
    if (manifest.version !== version) {
        throw new Error(
            `Version in manifest (${manifest.version}) does not match validated version (${version}).`,
        );
    }

    return JSON.stringify(manifest, null, 4);
}

export async function createPackage({ browser, srcDir, destFile }) {
    const packageJson = await readFile(
        path.join(srcDir, '../package.json'),
        'utf8',
    );
    const manifestJson = await readFile(
        path.join(srcDir, 'manifest.json'),
        'utf8',
    );
    await mkdir(path.dirname(destFile), { recursive: true });

    return await new Promise((resolve, reject) => {
        const output = createWriteStream(destFile);
        const archive = new ZipArchive({
            zlib: { level: 9 },
        });

        output.on('close', function () {
            resolve();
        });

        archive.on('error', function (err) {
            reject(err);
        });

        archive.pipe(output);

        archive.glob('**', {
            cwd: srcDir,
            ignore: ['images/**', 'manifest.json'],
        });

        for (const images of usedImages[browser]) {
            archive.glob(images, {
                cwd: srcDir,
            });
        }

        archive.append(
            enhanceManifestJson(packageJson, manifestJson, browser),
            {
                name: 'manifest.json',
            },
        );

        archive.finalize();
    });
}
