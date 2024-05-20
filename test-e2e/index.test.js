'use strict';

const { Key, until } = require('selenium-webdriver');

const createDriver = require('../tools/lib/create-web-driver');
const Server = require('../tools/lib/server');
const {
    MainSelectors,
    RequestSelectors,
    SettingsSelectors,
    wrapped,
} = require('../tools/lib/page-elements');
const pageNavigation = require('../tools/lib/page-navigation');

const timeout = 3000;
const baseUrl =
    'moz-extension://595108c3-fc1a-46bc-a6f6-918a6b1898aa/site/index.html';
jest.setTimeout(timeout * 100);

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let driver;
let server;
let MainElements;
let RequestElements;
let SettingsElements;
let goTo;
let switchRequestTab;

beforeAll(async function () {
    driver = await createDriver();
    await driver.get(baseUrl);
    MainElements = wrapped(MainSelectors, driver);
    RequestElements = wrapped(RequestSelectors, driver);
    SettingsElements = wrapped(SettingsSelectors, driver);
    goTo = pageNavigation.goTo(driver, baseUrl, timeout);
    switchRequestTab = pageNavigation.switchRequestTab(driver, timeout);

    server = new Server();
    await server.start();
});

afterAll(async function () {
    if (server) {
        await server.stop();
    }

    if (driver) {
        await driver.quit();
    }
});

test('title', async function () {
    await goTo('request');

    const title = await MainElements.title.getText();
    expect(title).toBe('RESTer');
});

describe('with browser requests', function () {
    beforeAll(async function () {
        await goTo('settings');
        await delay(500);
        await SettingsElements.requestMode.click();
        await delay(500);
        await SettingsElements.requestModeBrowserRequestsItem.click();
        await delay(500);
    });

    registerRequestTests('browser');
});

describe('with clean requests', function () {
    beforeAll(async function () {
        await goTo('settings');
        await delay(500);
        await SettingsElements.requestMode.click();
        await delay(500);
        await SettingsElements.requestModeCleanRequestsItem.click();
        await delay(500);
    });

    registerRequestTests('clean');
});

/**
 * Get innerText of the given element.
 *
 * Similar to WebElement#getText, which doesn't seem to work for rester-badge.
 */
function getInnerText(element) {
    return driver.executeScript((e) => e.innerText, element);
}

function registerRequestTests(mode) {
    test('GET http://127.0.0.1:7373/echo', async function () {
        await goTo('request');
        await driver
            .actions()
            .click(RequestElements.method)
            .sendKeys('GET', Key.TAB, `${server.url}/echo`)
            .perform();
        await switchRequestTab('headers');
        await driver
            .actions()
            .click(RequestElements.lastHeaderName)
            .sendKeys('User-Agent', Key.TAB, 'RESTer')
            .perform();
        await driver
            .actions()
            .click(RequestElements.lastHeaderName)
            .sendKeys('Accept', Key.TAB, 'text/plain')
            .perform();
        await RequestElements.send.click();
        await driver.wait(
            until.elementIsVisible(RequestElements.responseSection),
            timeout,
        );

        const responseCode = await getInnerText(RequestElements.responseCode);
        const responseBody = await driver.executeScript(
            (e) => e.value,
            RequestElements.responseBody,
        );
        expect(responseCode).toBe('200 OK');
        expect(responseBody).toMatchSnapshot();
    });

    test('POST http://127.0.0.1:7373/echo', async function () {
        await goTo('request');
        await driver
            .actions()
            .click(RequestElements.method)
            .sendKeys('POST', Key.TAB, '{host}/echo')
            .perform();
        await switchRequestTab('headers');
        await driver
            .actions()
            .click(RequestElements.lastHeaderName)
            .sendKeys('User-Agent', Key.TAB, 'RESTer')
            .perform();
        await driver
            .actions()
            .click(RequestElements.lastHeaderName)
            .sendKeys(
                'Content-Type',
                Key.TAB,
                'application/x-www-form-urlencoded',
            )
            .perform();
        await driver
            .actions()
            .click(RequestElements.lastHeaderName)
            .sendKeys('Custom-Header', Key.TAB, '**{host}**')
            .perform();
        await switchRequestTab('body');
        await driver
            .actions()
            .click(RequestElements.lastBodyFormInputName)
            .sendKeys('user', Key.TAB, 'test')
            .perform();
        await driver
            .actions()
            .click(RequestElements.lastBodyFormInputName)
            .sendKeys('token', Key.TAB, '{token}')
            .perform();
        await delay(100); // Pause seems necessary so RESTer can recognize the {token} variable
        await switchRequestTab('variables');
        await driver
            .actions()
            .sendKeys(Key.TAB, server.url, Key.TAB, 'a&b=c')
            .perform();
        await RequestElements.send.click();
        await driver.wait(
            until.elementIsVisible(RequestElements.responseSection),
            timeout,
        );

        const responseCode = await getInnerText(RequestElements.responseCode);
        const responseBody = await driver.executeScript(
            (e) => e.value,
            RequestElements.responseBody,
        );
        expect(responseCode).toBe('200 OK');
        expect(responseBody).toMatchSnapshot();
    });

    test('POST http://127.0.0.1:7373/redirect?how=307', async function () {
        await goTo('request');
        await driver
            .actions()
            .click(RequestElements.method)
            .sendKeys('POST', Key.TAB, `${server.url}/redirect?how=307`)
            .perform();
        await switchRequestTab('headers');
        await driver
            .actions()
            .click(RequestElements.lastHeaderName)
            .sendKeys('User-Agent', Key.TAB, 'RESTer')
            .perform();
        await RequestElements.send.click();
        await driver.wait(
            until.elementIsVisible(RequestElements.responseSection),
            timeout,
        );

        const responseCode = await getInnerText(RequestElements.responseCode);
        const responseBody = await driver.executeScript(
            (e) => e.value,
            RequestElements.responseBody,
        );
        if (mode === 'browser') {
            expect(responseCode).toBe('200 OK');
            expect(
                await RequestElements.responseRedirectInfo.isDisplayed(),
            ).toBe(true);
        } else {
            expect(responseCode).toBe('307 Temporary Redirect');
        }

        expect(responseBody).toMatchSnapshot();
    });

    test('GET http://127.0.0.1:7373/echo with cookie', async function () {
        // Set cookies for http://127.0.0.1:7373
        await driver.executeScript(`window.open('http://127.0.0.1:7373/')`);
        await delay(1000);
        const windows = await driver.getAllWindowHandles();
        await driver.switchTo().window(windows[1]);
        await driver.manage().addCookie({ name: 'number1', value: '10' });
        await driver.manage().addCookie({ name: 'number2', value: '20' });
        await driver.close();
        await driver.switchTo().window(windows[0]);

        // Perform request
        await goTo('request');
        await driver
            .actions()
            .click(RequestElements.method)
            .sendKeys('GET', Key.TAB, `${server.url}/echo`)
            .perform();
        await switchRequestTab('headers');
        await driver
            .actions()
            .click(RequestElements.lastHeaderName)
            .sendKeys('User-Agent', Key.TAB, 'RESTer')
            .perform();
        await driver
            .actions()
            .click(RequestElements.lastHeaderName)
            .sendKeys('Cookie', Key.TAB, 'number2=200;number3=300')
            .perform();
        await RequestElements.send.click();
        await driver.wait(
            until.elementIsVisible(RequestElements.responseSection),
            timeout,
        );

        const responseCode = await getInnerText(RequestElements.responseCode);
        const responseBody = await driver.executeScript(
            (e) => e.value,
            RequestElements.responseBody,
        );
        expect(responseCode).toBe('200 OK');
        expect(responseBody).toMatchSnapshot();
    });
}
