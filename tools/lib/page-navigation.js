'use strict';

const { until } = require('selenium-webdriver');

const { RequestSelectors, SettingsSelectors } = require('./page-elements');

const pages = {
    request: {
        url: '/',
        selector: RequestSelectors.page,
    },
    settings: {
        url: '/settings',
        selector: SettingsSelectors.page,
    },
};

exports.goTo = function (driver, baseUrl, timeout) {
    /* eslint-disable require-atomic-updates */

    let lastPage;
    let lastPageElement;

    return async function (page) {
        const { url, selector } = pages[page];

        await driver.get(`${baseUrl}#${url}`);
        await driver.wait(until.elementLocated(selector), timeout);
        if (page !== lastPage && lastPageElement) {
            await driver.wait(until.stalenessOf(lastPageElement), timeout);
        }

        lastPage = page;
        lastPageElement = await driver.findElement(selector);
    };
};

const tabs = {
    headers: {
        tabSelector: RequestSelectors.headersTab,
        contentSelector: RequestSelectors.headersTabContent,
    },
    body: {
        tabSelector: RequestSelectors.bodyTab,
        contentSelector: RequestSelectors.bodyTabContent,
    },
    variables: {
        tabSelector: RequestSelectors.variablesTab,
        contentSelector: RequestSelectors.variablesTabContent,
    },
};

exports.switchRequestTab = function (driver, timeout) {
    return async function (tab) {
        const { tabSelector, contentSelector } = tabs[tab];

        await driver.findElement(tabSelector).click();
        await driver.wait(until.elementLocated(contentSelector), timeout);
    };
};
