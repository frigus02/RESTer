'use strict';

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const { Builder } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');

const createPackage = require('./create-package');

const fsAccess = promisify(fs.access);
const rootDir = path.resolve(__dirname, '../../');


function ensureGeckoDriverInPath() {
    const geckodriverPath = path.resolve(rootDir, 'node_modules/geckodriver');
    const envPath = process.env.PATH || '';
    if (!envPath.includes(geckodriverPath)) {
        process.env.PATH = `${geckodriverPath};${envPath}`;
    }
}

async function ensurePresenceOfResterExtensionXpi() {
    const srcDir = path.resolve(rootDir, '.build');
    const xpiPath = path.resolve(rootDir, '.package/firefox-selenium.xpi');

    try {
        await fsAccess(xpiPath);
    } catch (e) {
        await createPackage({
            browser: 'firefox',
            srcDir,
            destFile: xpiPath
        });
    }
}

async function createWebDriver() {
    ensureGeckoDriverInPath();
    await ensurePresenceOfResterExtensionXpi();

    const options = new firefox.Options()
        .setBinary(firefox.Channel.AURORA)
        .headless()
        .setPreference('extensions.webextensions.uuids', '{"rester@kuehle.me":"595108c3-fc1a-46bc-a6f6-918a6b1898aa"}')
        .setPreference('xpinstall.signatures.required', false)
        .setPreference('intl.accept_languages', 'en')
        .addExtensions(path.resolve(rootDir, '.package/firefox-selenium.xpi'));

    const driver = await new Builder()
        .forBrowser('firefox')
        .setFirefoxOptions(options)
        .build();

    return driver;
}

module.exports = createWebDriver;
