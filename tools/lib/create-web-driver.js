'use strict';

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const { Builder } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');

const createPackage = require('./create-package');

const fsUnlink = promisify(fs.unlink);
const rootDir = path.resolve(__dirname, '../../');

firefox.Channel.AURORA = new firefox.Channel(
    // The path to Firefox Developer Edition has spaces in it on macOS, which was not the case in
    // https://github.com/SeleniumHQ/selenium/blob/b4b7674a8a4e2802e7e9a1c4fa85201a2413b781/javascript/node/selenium-webdriver/firefox.js#L745
    '/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox-bin',
    'Firefox Developer Edition\\firefox.exe'
);

function ensureGeckoDriverInPath() {
    const geckodriverPath = path.resolve(rootDir, 'node_modules/geckodriver');
    const envPath = process.env.PATH || '';
    if (!envPath.includes(geckodriverPath)) {
        process.env.PATH = `${geckodriverPath};${envPath}`;
    }
}

async function createResterExtensionXpi() {
    const srcDir = path.resolve(rootDir, 'build');
    const xpiPath = path.resolve(rootDir, 'package/firefox-selenium.xpi');

    try {
        await fsUnlink(xpiPath);
    } catch (e) {
        if (e.code !== 'ENOENT') {
            throw e;
        }
    }

    await createPackage({
        browser: 'firefox',
        srcDir,
        destFile: xpiPath,
    });
}

async function createWebDriver() {
    ensureGeckoDriverInPath();
    await createResterExtensionXpi();

    const options = new firefox.Options()
        .setBinary(firefox.Channel.AURORA)
        .setPreference(
            'extensions.webextensions.uuids',
            '{"rester@kuehle.me":"595108c3-fc1a-46bc-a6f6-918a6b1898aa"}'
        )
        .setPreference('xpinstall.signatures.required', false)
        .setPreference('intl.accept_languages', 'en')
        .addExtensions(path.resolve(rootDir, 'package/firefox-selenium.xpi'));

    if (!process.env.WITH_HEAD) {
        options.headless();
    }

    const driver = await new Builder()
        .forBrowser('firefox')
        .setFirefoxOptions(options)
        .build();

    return driver;
}

module.exports = createWebDriver;
