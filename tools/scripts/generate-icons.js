/* eslint-disable no-console */

'use strict';

const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const rimraf = promisify(require('rimraf'));
const xml2js = require('xml2js');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);
const exec = promisify(childProcess.exec);

const rootDir = __dirname + '/../..';
const sizes = [
    { px: 128, dpi: 768 },
    { px: 96, dpi: 576 },
    { px: 48, dpi: 288 },
    { px: 32, dpi: 192 },
    { px: 24, dpi: 144 },
    { px: 16, dpi: 96 },
];
const variations = ['', '-dev', '-light', '-light-dev'];

async function main() {
    // Read icon
    const parser = new xml2js.Parser();
    const parseString = promisify(parser.parseString).bind(parser);
    const iconBuffer = await readFile(rootDir + '/resources/icon.svg');
    const iconXml = await parseString(iconBuffer);

    // Create clean working folder
    await rimraf(rootDir + '/.icons');
    await mkdir(rootDir + '/.icons');

    // Create different icon versions
    const builder = new xml2js.Builder();

    // - Dark (default) DEV
    await writeFile(
        rootDir + '/.icons/icon-dev.svg',
        builder.buildObject(iconXml),
        { encoding: 'utf8' }
    );

    // - Light DEV
    iconXml.svg.path.forEach((path) => {
        path.$.style = path.$.style.replace('fill:#0c0c0d', 'fill:#f9f9fa');
    });
    await writeFile(
        rootDir + '/.icons/icon-light-dev.svg',
        builder.buildObject(iconXml),
        { encoding: 'utf8' }
    );

    // - Light
    const devGroupIndex = iconXml.svg.g.findIndex(
        (node) => node.$.id === 'dev'
    );
    iconXml.svg.g.splice(devGroupIndex, 1);
    await writeFile(
        rootDir + '/.icons/icon-light.svg',
        builder.buildObject(iconXml),
        { encoding: 'utf8' }
    );

    // - Dark (default)
    iconXml.svg.path.forEach((path) => {
        path.$.style = path.$.style.replace('fill:#f9f9fa', 'fill:#0c0c0d');
    });
    await writeFile(
        rootDir + '/.icons/icon.svg',
        builder.buildObject(iconXml),
        { encoding: 'utf8' }
    );

    // Export PNGs
    for (const variation of variations) {
        for (const size of sizes) {
            const inputSvg = path.resolve(
                `${rootDir}/.icons/icon${variation}.svg`
            );
            const outputPng = path.resolve(
                `${rootDir}/src/images/icon${variation}${size.px}.png`
            );
            await exec(
                [
                    '"C:\\Program Files\\Inkscape\\inkscape.com"',
                    `--without-gui`,
                    `--export-png="${outputPng}"`,
                    `--export-area-page`,
                    `--export-dpi=${size.dpi}`,
                    `"${inputSvg}"`,
                ].join(' ')
            );
        }
    }

    // Clean up
    await rimraf(rootDir + '/.icons');
}

main().catch((err) => console.error(err.stack));
