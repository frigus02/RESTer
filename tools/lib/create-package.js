'use strict';

const { createWriteStream } = require('fs');
const { readFile, mkdir } = require('fs/promises');
const path = require('path');

const archiver = require('archiver');

const packageJson = require('../../package.json');

function validateManifest(manifestJson) {
    const manifest = JSON.parse(manifestJson);

    if (manifest.version !== packageJson.version) {
        throw new Error(
            `Version in manifest (${manifest.version}) does not match validated version (${packageJson.version}).`
        );
    }
}

async function createPackage({ srcDir, destFile }) {
    const manifestJson = await readFile(
        path.join(srcDir, 'manifest.json'),
        'utf8'
    );
    validateManifest(manifestJson);
    await mkdir(path.dirname(destFile), { recursive: true });

    return await new Promise((resolve, reject) => {
        const output = createWriteStream(destFile);
        const archive = archiver('zip', {
            zlib: { level: 9 },
        });
        output.on('close', function () {
            resolve();
        });
        archive.on('error', function (err) {
            reject(err);
        });
        archive.pipe(output);
        archive.glob('**', { cwd: srcDir, follow: true });
        archive.finalize();
    });
}

module.exports = createPackage;
