import { PolymerElement } from '../../../../node_modules/@polymer/polymer/polymer-element.js';
import dialogs from '../data/scripts/dialogs.js';

/**
 * @polymer
 * @customElement
 */
class RESTerAuthorizationProviderCustom extends PolymerElement {
    static get is() {
        return 'rester-authorization-provider-custom';
    }

    static get properties() {
        return {
            providerId: {
                type: Number,
                readOnly: true,
                value: 1
            },
            title: {
                type: String,
                readOnly: true,
                value: 'Custom'
            },
            needsConfiguration: {
                type: Boolean,
                readOnly: true,
                value: false
            },
            supportsIncognito: {
                type: Boolean,
                readOnly: true,
                value: false
            }
        };
    }

    generateToken() {
        const data = {
            scheme: '',
            token: '',
            toBase64: false,
        };

        return dialogs.authProviderCustomGenerateToken
            .show(data)
            .then(result => {
                if (!result.reason.confirmed) {
                    return Promise.reject();
                }

                const token = {};
                token.scheme = data.scheme;

                if (data.toBase64) {
                    token.token = window.btoa(data.token);
                    token.title = `${data.scheme} Base64(${data.token})`;
                } else {
                    token.title = `${data.scheme} ${data.token}`;
                    token.token = data.token;
                }

                return token;
            });
    }
}

customElements.define(
    RESTerAuthorizationProviderCustom.is,
    RESTerAuthorizationProviderCustom
);
