'use strict';

const { By } = require('selenium-webdriver');

exports.MainSelectors = {
    title: By.css('app-drawer [main-title]')
};

const responseSection = 'section.style-scope:nth-child(2)';
exports.RequestSelectors = {
    page: By.css('rester-page-request'),
    method: By.css('.method-input > paper-input-container:nth-child(1) > div:nth-child(2) > div:nth-child(2) > iron-input:nth-child(2) > input:nth-child(1)'),
    headerName: headerNumber => By.css(`div.header-line:nth-child(${headerNumber}) > rester-autocomplete-input:nth-child(1) > paper-input-container:nth-child(1) > div:nth-child(2) > div:nth-child(2) > iron-input:nth-child(2) > input:nth-child(1)`),
    send: By.css('paper-button.send-button:nth-child(4)'),
    responseSection: By.css(responseSection),
    responseCode: By.css(`${responseSection} rester-badge`),
    responseBody: By.css(`${responseSection} rester-ace-input`)
};

exports.SettingsSelectors = {
    page: By.css('rester-page-settings'),
    requestMode: By.css('div.setting:nth-child(2) > paper-dropdown-menu:nth-child(1)'),
    requestModeBrowserRequestsItem: By.css('div.setting:nth-child(2) > paper-dropdown-menu:nth-child(1) > paper-menu-button:nth-child(2) > iron-dropdown:nth-child(2) > div:nth-child(1) > div:nth-child(1) > paper-listbox:nth-child(1) > paper-item:nth-child(1)'),
    requestModeCleanRequestsItem: By.css('div.setting:nth-child(2) > paper-dropdown-menu:nth-child(1) > paper-menu-button:nth-child(2) > iron-dropdown:nth-child(2) > div:nth-child(1) > div:nth-child(1) > paper-listbox:nth-child(1) > paper-item:nth-child(2)')
};

exports.wrapped = function (selectors, driver) {
    const wrapper = {};
    Object.keys(selectors).forEach(key => {
        const selector = selectors[key];
        if (selector instanceof Function) {
            wrapper[key] = (...args) => driver.findElement(selector(...args));
        } else {
            Object.defineProperty(wrapper, key, {
                get: () => driver.findElement(selector),
                enumerable: true
            });
        }
    });

    return wrapper;
};
