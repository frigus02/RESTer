'use strict';

const { By } = require('selenium-webdriver');

function queryThroughShadowDOM(selectorChain) {
    /* eslint-env browser */
    return selectorChain.reduce(
        (parent, selector) => {
            if (parent && parent.shadowRoot) {
                return parent.shadowRoot.querySelector(selector);
            }
        },
        { shadowRoot: document }
    );
}

exports.MainSelectors = {
    title: By.js(queryThroughShadowDOM, [
        'rester-app',
        'app-drawer [main-title]'
    ])
};

const responseSection = 'section:nth-child(2)';
exports.RequestSelectors = {
    page: By.js(queryThroughShadowDOM, ['rester-app', 'rester-page-request']),
    method: By.js(queryThroughShadowDOM, [
        'rester-app',
        'rester-page-request',
        '.method-input',
        'input'
    ]),
    lastHeaderName: By.js(queryThroughShadowDOM, [
        'rester-app',
        'rester-page-request',
        'rester-header-input',
        '.header-line:last-of-type rester-autocomplete-input:nth-child(1)',
        'input'
    ]),
    send: By.js(queryThroughShadowDOM, [
        'rester-app',
        'rester-page-request',
        '.send-button'
    ]),
    responseSection: By.js(queryThroughShadowDOM, [
        'rester-app',
        'rester-page-request',
        responseSection
    ]),
    responseCode: By.js(queryThroughShadowDOM, [
        'rester-app',
        'rester-page-request',
        `${responseSection} rester-badge`
    ]),
    responseBody: By.js(queryThroughShadowDOM, [
        'rester-app',
        'rester-page-request',
        `${responseSection} rester-highlight-body`,
        'rester-ace-input'
    ])
};

exports.SettingsSelectors = {
    page: By.js(queryThroughShadowDOM, ['rester-app', 'rester-page-settings']),
    requestMode: By.js(queryThroughShadowDOM, [
        'rester-app',
        'rester-page-settings',
        '.setting:nth-child(2) paper-dropdown-menu'
    ]),
    requestModeBrowserRequestsItem: By.js(queryThroughShadowDOM, [
        'rester-app',
        'rester-page-settings',
        '.setting:nth-child(2) paper-dropdown-menu paper-item:nth-child(1)'
    ]),
    requestModeCleanRequestsItem: By.js(queryThroughShadowDOM, [
        'rester-app',
        'rester-page-settings',
        '.setting:nth-child(2) paper-dropdown-menu paper-item:nth-child(2)'
    ])
};

exports.wrapped = function(selectors, driver) {
    const wrapper = {};
    Object.keys(selectors).forEach(key => {
        const selector = selectors[key];
        Object.defineProperty(wrapper, key, {
            get: () => driver.findElement(selector),
            enumerable: true
        });
    });

    return wrapper;
};
