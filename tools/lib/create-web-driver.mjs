import { unlink } from 'fs/promises';
import * as path from 'path';

import { Builder } from 'selenium-webdriver';
import * as firefox from 'selenium-webdriver/firefox';

import { createPackage } from './create-package.mjs';

const rootDir = path.resolve(import.meta.dirname, '../../');

async function createResterExtensionXpi() {
    const srcDir = path.resolve(rootDir, 'build');
    const xpiPath = path.resolve(rootDir, 'package/firefox-selenium.xpi');

    try {
        await unlink(xpiPath);
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

export async function createWebDriver() {
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

    const serviceBuilder = new firefox.ServiceBuilder().addArguments(
        '--allow-system-access',
    );

    const driver = await new Builder()
        .forBrowser('firefox')
        .setFirefoxOptions(options)
        .setFirefoxService(serviceBuilder)
        .build();

    return driver;
}
