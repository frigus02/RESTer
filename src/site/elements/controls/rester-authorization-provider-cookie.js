import { PolymerElement } from '../../../../node_modules/@polymer/polymer/polymer-element.js';
import * as browserRequest from '../data/scripts/browser-request.js';
import dialogs from '../data/scripts/dialogs.js';
import { prepareConfigWithEnvVariables } from '../data/scripts/util.js';
import { clone } from '../../../shared/util.js';

async function ensureCookiesPermission() {
    const requiredPermissions = {
        permissions: ['cookies'],
    };

    return new Promise((resolve, reject) => {
        chrome.permissions.request(requiredPermissions, (result) => {
            if (result) {
                resolve();
            } else {
                reject(
                    'RESTer needs the permissions to read cookies for this.'
                );
            }
        });
    });
}

function filterCookies(cookies, cookieNames) {
    const names = (cookieNames || '')
        .trim()
        .split(/\s*;\s*/i)
        .filter((name) => name.length > 0);
    if (names.length > 0) {
        return cookies.filter((cookie) => names.includes(cookie.name));
    } else {
        return cookies;
    }
}

function getShortestCookieExpirationDate(cookies) {
    if (cookies.length > 0) {
        // For simplicity give session cookies an expiration date of 1 day.
        const sessionExpirationDate = Date.now() / 1000 + 86400;

        const expirationDate = cookies
            .map((cookie) =>
                cookie.session ? sessionExpirationDate : cookie.expirationDate
            )
            .reduce((prev, current) =>
                !prev || prev > current ? current : prev
            );
        if (expirationDate) {
            // The cookie expiration date is specified in seconds while the
            // Date object uses milliseconds. So we need to multiply by 1000.
            return new Date(expirationDate * 1000);
        }
    }

    return undefined;
}

/**
 * @polymer
 * @customElement
 */
class RESTerAuthorizationProviderCookie extends PolymerElement {
    static get is() {
        return 'rester-authorization-provider-cookie';
    }

    static get properties() {
        return {
            providerId: {
                type: Number,
                readOnly: true,
                value: 4,
            },
            title: {
                type: String,
                readOnly: true,
                value: 'Cookie',
            },
            needsConfiguration: {
                type: Boolean,
                readOnly: true,
                value: true,
            },
            supportsIncognito: {
                type: Boolean,
                readOnly: true,
                value: true,
            },
        };
    }

    createConfiguration() {
        return this.editConfiguration({});
    }

    async editConfiguration(config) {
        const newConfig = clone(config);
        const result = await dialogs.authProviderCookieConfiguration.show(
            newConfig
        );
        if (result.reason.confirmed && result.reason.action === 'save') {
            newConfig.providerId = this.providerId;
            return newConfig;
        } else if (
            result.reason.confirmed &&
            result.reason.action === 'delete'
        ) {
            return 'delete';
        } else {
            throw new Error('Cancelled');
        }
    }

    async generateToken(config) {
        await ensureCookiesPermission();

        config = await prepareConfigWithEnvVariables(config);

        const response = await browserRequest.send({
            url: config.startUrl,
            targetUrl: config.endUrl,
            incognito: config.incognito,
            extractCookies: true,
        });

        const filteredCookies = filterCookies(
            response.cookies,
            config.cookieNames
        );
        const shortedExpirationDate = getShortestCookieExpirationDate(
            filteredCookies
        );

        const token = {
            title: 'Unknown',
            scheme: 'Cookie',
            token: filteredCookies.map((c) => `${c.name}=${c.value}`).join(';'),
            expirationDate: shortedExpirationDate,
        };

        if (config.enableVariables && config.env) {
            token.title += ` (Environment: ${config.env.name})`;
        }

        return token;
    }
}

customElements.define(
    RESTerAuthorizationProviderCookie.is,
    RESTerAuthorizationProviderCookie
);
