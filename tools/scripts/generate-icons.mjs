/* eslint-disable no-console */

'use strict';

import { exec as _exec } from 'child_process';
import { readFile, writeFile, rm, mkdir } from 'fs/promises';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

import { Parser, Builder } from 'xml2js';

const exec = promisify(_exec);

const rootUrl = new URL('../../', import.meta.url);
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
    const parser = new Parser();
    const parseString = promisify(parser.parseString).bind(parser);
    const iconBuffer = await readFile(new URL('resources/icon.svg', rootUrl));
    const iconXml = await parseString(iconBuffer);

    // Create clean working folder
    await rm(new URL('.icons', rootUrl), { force: true, recursive: true });
    await mkdir(new URL('.icons', rootUrl));

    // Create different icon versions
    const builder = new Builder();

    // - Dark (default) DEV
    await writeFile(
        new URL('.icons/icon-dev.svg', rootUrl),
        builder.buildObject(iconXml),
        { encoding: 'utf8' }
    );

    // - Light DEV
    iconXml.svg.path.forEach((path) => {
        path.$.style = path.$.style.replace('fill:#0c0c0d', 'fill:#f9f9fa');
    });
    await writeFile(
        new URL('.icons/icon-light-dev.svg', rootUrl),
        builder.buildObject(iconXml),
        { encoding: 'utf8' }
    );

    // - Light
    const devGroupIndex = iconXml.svg.g.findIndex(
        (node) => node.$.id === 'dev'
    );
    iconXml.svg.g.splice(devGroupIndex, 1);
    await writeFile(
        new URL('.icons/icon-light.svg', rootUrl),
        builder.buildObject(iconXml),
        { encoding: 'utf8' }
    );

    // - Dark (default)
    iconXml.svg.path.forEach((path) => {
        path.$.style = path.$.style.replace('fill:#f9f9fa', 'fill:#0c0c0d');
    });
    await writeFile(
        new URL('.icons/icon.svg', rootUrl),
        builder.buildObject(iconXml),
        { encoding: 'utf8' }
    );

    // Export PNGs
    for (const variation of variations) {
        for (const size of sizes) {
            const inputSvg = fileURLToPath(
                new URL(`.icons/icon${variation}.svg`, rootUrl)
            );
            const outputPng = fileURLToPath(
                new URL(`src/images/icon${variation}${size.px}.png`, rootUrl)
            );
            await exec(
                [
                    'inkscape',
                    '--export-type=png',
                    `--export-filename="${outputPng}"`,
                    `--export-area-page`,
                    `--export-dpi=${size.dpi}`,
                    `"${inputSvg}"`,
                ].join(' ')
            );
        }
    }

    // Clean up
    await rm(new URL('.icons', rootUrl), { force: true, recursive: true });
}

main().catch((err) => console.error(err.stack));
