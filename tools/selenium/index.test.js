/* eslint-env node, jest */

'use strict';

const { Key, until } = require('selenium-webdriver');

const createDriver = require('../lib/create-web-driver');
const Server = require('../lib/server');
const { MainSelectors, RequestSelectors, SettingsSelectors, wrapped } = require('../lib/page-elements');
const pageNavigation = require('../lib/page-navigation');

const timeout = 3000;
const baseUrl = 'moz-extension://595108c3-fc1a-46bc-a6f6-918a6b1898aa/site/index.html';
jest.setTimeout(timeout * 100);

let driver;
let server;
let MainElements;
let RequestElements;
let SettingsElements;
let goTo;

beforeAll(async function () {
    driver = await createDriver();
    await driver.get(baseUrl);
    MainElements = wrapped(MainSelectors, driver);
    RequestElements = wrapped(RequestSelectors, driver);
    SettingsElements = wrapped(SettingsSelectors, driver);
    goTo = pageNavigation.goTo(driver, baseUrl, timeout);

    server = new Server();
    await server.start();
});

afterAll(async function () {
    await server.stop();
    await driver.quit();
});

test('title', async function () {
    await goTo('request');

    const title = await MainElements.title.getText();
    expect(title).toBe('RESTer');
});

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

describe('with browser requests', function () {
    beforeAll(async function () {
        await goTo('settings');
        await SettingsElements.requestMode.click();
        await delay(1000);
        await SettingsElements.requestModeBrowserRequestsItem.click();
        await delay(1000);
    });

    registerRequestTests();
});

describe('with clean requests', function () {
    beforeAll(async function () {
        await goTo('settings');
        await SettingsElements.requestMode.click();
        await delay(1000);
        await SettingsElements.requestModeCleanRequestsItem.click();
        await delay(1000);
    });

    registerRequestTests();
});

function registerRequestTests() {
    test('GET http://127.0.0.1:7373/echo', async function () {
        await goTo('request');
        await RequestElements.method.sendKeys('GET', Key.TAB, `${server.url}/echo`);
        await RequestElements.headerName(1).sendKeys('User-Agent', Key.TAB, 'RESTer');
        await RequestElements.send.click();
        await driver.wait(until.elementIsVisible(RequestElements.responseSection), timeout);

        const responseCode = await RequestElements.responseCode.getText();
        const responseBody = await driver.executeScript(e => e.value, RequestElements.responseBody);
        expect(responseCode).toBe('200 OK');
        expect(responseBody).toMatchSnapshot();
    });
}
