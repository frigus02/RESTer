'use strict';

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const { Builder } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');

const createPackage = require('./create-package');

const fsUnlink = promisify(fs.unlink);
const rootDir = path.resolve(__dirname, '../../');

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
    await createResterExtensionXpi();

    const options = new firefox.Options()
        .setBinary(await firefox.Channel.DEV.locate())
        .setPreference(
            'extensions.webextensions.uuids',
            '{"rester@kuehle.me":"595108c3-fc1a-46bc-a6f6-918a6b1898aa"}',
        )
        .setPreference('xpinstall.signatures.required', false)
        .setPreference('intl.accept_languages', 'en')
        .addExtensions(path.resolve(rootDir, 'package/firefox-selenium.xpi'));

    if (!process.env.WITH_HEAD) {
        options.addArguments('-headless');
    }

    const driver = await new Builder()
        .forBrowser('firefox')
        .setFirefoxOptions(options)
        .build();

    return driver;
}

module.exports = createWebDriver;
