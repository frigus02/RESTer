'use strict';

const { readFile, mkdir, writeFile } = require('fs/promises');
const path = require('path');

function replaceDevWithProdIcons(manifest) {
    const parsed = JSON.parse(manifest);
    for (const key of Object.keys(parsed.icons)) {
        parsed.icons[key] = parsed.icons[key].replace('-dev', '');
    }
    for (const key of Object.keys(parsed.action.default_icon)) {
        parsed.action.default_icon[key] = parsed.action.default_icon[
            key
        ].replace('-dev', '');
    }
    if (parsed.action.theme_icons) {
        for (const icon of parsed.action.theme_icons) {
            icon.dark = icon.dark.replace('-dev', '');
            icon.light = icon.light.replace('-dev', '');
        }
    }
    return JSON.stringify(parsed, null, 4);
}

function getReferencedIcons(manifest) {
    const parsed = JSON.parse(manifest);
    const icons = [
        ...Object.values(parsed.icons),
        ...Object.values(parsed.action.default_icon),
    ];
    if (parsed.action.theme_icons) {
        for (const icon of parsed.action.theme_icons) {
            icons.push(icon.dark);
            icons.push(icon.light);
        }
    }
    return icons;
}

async function copyManifestAndIcons({ browser, srcDir, destDir, mode }) {
    const manifestPath = path.join(srcDir, `manifest-${browser}.json`);
    let manifest = await readFile(manifestPath, 'utf8');
    if (mode === 'production') {
        manifest = replaceDevWithProdIcons(manifest);
    }
    const icons = getReferencedIcons(manifest);

    await mkdir(destDir, { recursive: true });
    await writeFile(path.join(destDir, 'manifest.json'), manifest, 'utf8');
    for (const icon of icons) {
        const destFile = path.join(destDir, icon);
        await mkdir(path.dirname(destFile), { recursive: true });
        await writeFile(destFile, await readFile(path.join(srcDir, icon)));
    }
}

module.exports = copyManifestAndIcons;
