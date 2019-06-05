import { PolymerElement } from '../../../../node_modules/@polymer/polymer/polymer-element.js';
import dialogs from '../data/scripts/dialogs.js';
import { generateToken as generateOAuth2Token } from '../data/scripts/oauth2.js';
import { clone } from '../../../shared/util.js';

/**
 * @polymer
 * @customElement
 */
class RESTerAuthorizationProviderOAuth2 extends PolymerElement {
    static get is() {
        return 'rester-authorization-provider-oauth2';
    }

    static get properties() {
        return {
            providerId: {
                type: Number,
                readOnly: true,
                value: 3
            },
            title: {
                type: String,
                readOnly: true,
                value: 'OAuth 2'
            },
            needsConfiguration: {
                type: Boolean,
                readOnly: true,
                value: true
            },
            supportsIncognito: {
                type: Boolean,
                readOnly: true,
                value: true
            }
        };
    }

    createConfiguration() {
        return this.editConfiguration({
            flow: null,
            accessTokenRequestMethod: 'POST',
            accessTokenRequestAuthentication: 'basic'
        });
    }

    editConfiguration(config) {
        const newConfig = clone(config);

        return dialogs.authProviderOAuth2Configuration
            .show(newConfig)
            .then(result => {
                if (
                    result.reason.confirmed &&
                    result.reason.action === 'save'
                ) {
                    newConfig.providerId = this.providerId;
                    return newConfig;
                } else if (
                    result.reason.confirmed &&
                    result.reason.action === 'delete'
                ) {
                    return 'delete';
                } else {
                    return Promise.reject();
                }
            });
    }

    generateToken(config) {
        return Promise.resolve()
            .then(() => {
                if (config.flow === 'resource_owner') {
                    return this._getResourceOwnerGenerateTokenData();
                }
            })
            .then(creds => {
                return generateOAuth2Token(config, creds);
            });
    }

    _getResourceOwnerGenerateTokenData() {
        const creds = {
            username: '',
            password: ''
        };

        return dialogs.authProviderOAuth2GenerateTokenResourceOwner
            .show(creds)
            .then(result => {
                if (result.reason.confirmed) {
                    return creds;
                } else {
                    return Promise.reject();
                }
            });
    }
}

customElements.define(
    RESTerAuthorizationProviderOAuth2.is,
    RESTerAuthorizationProviderOAuth2
);
