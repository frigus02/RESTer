import { PolymerElement } from '../../../../node_modules/@polymer/polymer/polymer-element.js';
import { html } from '../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js';
import '../../../../node_modules/@polymer/iron-a11y-keys/iron-a11y-keys.js';
import '../../../../node_modules/@polymer/iron-form/iron-form.js';
import '../../../../node_modules/@polymer/neon-animation/animations/fade-out-animation.js';
import '../../../../node_modules/@polymer/neon-animation/animations/scale-up-animation.js';
import '../../../../node_modules/@polymer/paper-button/paper-button.js';
import '../../../../node_modules/@polymer/paper-checkbox/paper-checkbox.js';
import '../../../../node_modules/@polymer/paper-dialog-scrollable/paper-dialog-scrollable.js';
import '../../../../node_modules/@polymer/paper-dialog/paper-dialog.js';
import '../../../../node_modules/@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
import '../../../../node_modules/@polymer/paper-input/paper-input.js';
import '../../../../node_modules/@polymer/paper-item/paper-item.js';
import '../../../../node_modules/@polymer/paper-listbox/paper-listbox.js';
import '../../../../node_modules/web-animations-js/web-animations-next-lite.min.js';
import resterHintStyle from '../styles/rester-hint.js';
import RESTerDialogControllerMixin from './rester-dialog-controller-mixin.js';

/**
 * @appliesMixin RESTerDialogControllerMixin
 * @polymer
 * @customElement
 */
class RESTerAuthorizationProviderOAuth2ConfigurationDialog extends RESTerDialogControllerMixin(
    PolymerElement
) {
    static get template() {
        return html`
            ${resterHintStyle}

            <style>
                paper-dialog {
                    max-width: 600px;
                }

                [hidden] {
                    display: none !important;
                }

                form {
                    /*
                    * The paper-input-error inside of the paper-input is positioned
                    * absolute underneath the input and has 20px height. Without the
                    * padding the dialog would start scrolling.
                    */
                    padding-bottom: 20px;
                }

                paper-checkbox,
                paper-dropdown-menu {
                    display: block;
                }

                paper-checkbox {
                    padding: 16px 0;
                }

                .delete-button {
                    color: var(--error-color);
                    margin-left: -8px;
                    margin-right: auto;
                }
            </style>

            <paper-dialog id="dialog"
                    entry-animation="scale-up-animation"
                    exit-animation="fade-out-animation"
                    with-backdrop>
                <paper-dialog-scrollable>
                    <iron-a11y-keys
                            target="[[form]]"
                            keys="enter"
                            on-keys-pressed="_save"
                            stop-keyboard-event-propagation></iron-a11y-keys>
                    <iron-form id="dialogForm">
                        <form>
                            <paper-input
                                    label="Title"
                                    value="{{data.title}}"
                                    required
                                    error-message="This is required!"
                                    autofocus></paper-input>
                            <div class="hint">A name for this configuration, only used to identify the config in RESTer.</div>
                            <paper-checkbox checked="{{data.enableVariables}}">
                                Enable environment variables
                            </paper-checkbox>
                            <paper-dropdown-menu
                                    label="OAuth 2 Flow"
                                    required
                                    error-message="This is required!">
                                <paper-listbox
                                        slot="dropdown-content"
                                        selected="{{data.flow}}"
                                        attr-for-selected="value">
                                    <paper-item value="code">Authorization Code</paper-item>
                                    <paper-item value="implicit">Implicit</paper-item>
                                    <paper-item value="client_credentials">Client Credentials</paper-item>
                                    <paper-item value="resource_owner">Resource Owner Password Credentials</paper-item>
                                </paper-listbox>
                            </paper-dropdown-menu>
                            <paper-input
                                    label="Authorization Request: Endpoint"
                                    value="{{data.authorizationRequestEndpoint}}"
                                    hidden$="[[!_isFieldVisible('authorizationRequestEndpoint', data.flow)]]"
                                    required$="[[_isFieldVisible('authorizationRequestEndpoint', data.flow)]]"
                                    error-message="This is required!"></paper-input>
                            <paper-dropdown-menu
                                    label="Access Token Request: Method"
                                    hidden$="[[!_isFieldVisible('accessTokenRequestMethod', data.flow)]]"
                                    required$="[[_isFieldVisible('accessTokenRequestMethod', data.flow)]]">
                                <paper-listbox
                                        slot="dropdown-content"
                                        selected="{{data.accessTokenRequestMethod}}"
                                        attr-for-selected="value">
                                    <paper-item value="POST">POST</paper-item>
                                    <paper-item value="GET">GET</paper-item>
                                </paper-listbox>
                            </paper-dropdown-menu>
                            <paper-input
                                    label="Access Token Request: Endpoint"
                                    value="{{data.accessTokenRequestEndpoint}}"
                                    hidden$="[[!_isFieldVisible('accessTokenRequestEndpoint', data.flow)]]"
                                    required$="[[_isFieldVisible('accessTokenRequestEndpoint', data.flow)]]"
                                    error-message="This is required!"></paper-input>
                            <paper-dropdown-menu
                                    label="Access Token Request: Client Authentication"
                                    hidden$="[[!_isFieldVisible('accessTokenRequestAuthentication', data.flow)]]"
                                    required$="[[_isFieldVisible('accessTokenRequestAuthentication', data.flow)]]">
                                <paper-listbox
                                        slot="dropdown-content"
                                        selected="{{data.accessTokenRequestAuthentication}}"
                                        attr-for-selected="value">
                                    <paper-item value="none">None (public client)</paper-item>
                                    <paper-item value="basic">HTTP Basic authentication</paper-item>
                                    <paper-item value="body">Credentials in request body</paper-item>
                                </paper-listbox>
                            </paper-dropdown-menu>
                            <paper-input
                                    label="Client ID"
                                    value="{{data.clientId}}"
                                    hidden$="[[!_isFieldVisible('clientId', data.flow)]]"
                                    required$="[[_isFieldVisible('clientId', data.flow)]]"
                                    error-message="This is required!"></paper-input>
                            <paper-input
                                    label="Client Secret"
                                    value="{{data.clientSecret}}"
                                    hidden$="[[!_isFieldVisible('clientSecret', data.flow, data.accessTokenRequestAuthentication)]]"></paper-input>
                            <paper-input
                                    label="Redirect URI"
                                    value="{{data.redirectUri}}"
                                    hidden$="[[!_isFieldVisible('redirectUri', data.flow)]]"
                                    required$="[[_isFieldVisible('redirectUri', data.flow)]]"
                                    error-message="This is required!"></paper-input>
                            <div class="hint">Please provide any valid redirect uri for the OAuth 2 client. When this URL is loaded, RESTer will grab the access token from the URL and finish the authorization flow.</div>
                            <paper-input
                                    hidden$="[[!_isFieldVisible('scope', data.flow)]]"
                                    label="Scope"
                                    value="{{data.scope}}"></paper-input>
                        </form>
                    </iron-form>
                </paper-dialog-scrollable>
                <div class="buttons">
                    <paper-button class="delete-button" hidden$="[[!data.id]]" on-tap="_delete">
                        Delete
                    </paper-button>
                    <paper-button dialog-dismiss>
                        Cancel
                    </paper-button>
                    <paper-button on-tap="_save">
                        Save
                    </paper-button>
                </div>
            </paper-dialog>
        `;
    }

    static get is() {
        return 'rester-authorization-provider-oauth2-configuration-dialog';
    }

    static get properties() {
        return {
            data: Object,
            form: Object
        };
    }

    static get observers() {
        return ['_notifyConfigurationDialogResize(data.flow)'];
    }

    static get resterDialogId() {
        return 'authProviderOAuth2Configuration';
    }

    static get _configProperties() {
        return {
            code: [
                'id',
                'providerId',
                'title',
                'enableVariables',
                'flow',
                'authorizationRequestEndpoint',
                'accessTokenRequestMethod',
                'accessTokenRequestEndpoint',
                'accessTokenRequestAuthentication',
                'clientId',
                'clientSecret',
                'redirectUri',
                'scope'
            ],
            implicit: [
                'id',
                'providerId',
                'title',
                'enableVariables',
                'flow',
                'authorizationRequestEndpoint',
                'clientId',
                'redirectUri',
                'scope'
            ],
            client_credentials: [
                'id',
                'providerId',
                'title',
                'enableVariables',
                'flow',
                'accessTokenRequestMethod',
                'accessTokenRequestEndpoint',
                'accessTokenRequestAuthentication',
                'clientId',
                'clientSecret',
                'scope'
            ],
            resource_owner: [
                'id',
                'providerId',
                'title',
                'enableVariables',
                'flow',
                'accessTokenRequestMethod',
                'accessTokenRequestEndpoint',
                'accessTokenRequestAuthentication',
                'clientId',
                'clientSecret',
                'scope'
            ]
        };
    }

    ready() {
        super.ready();
        this.form = this.$.dialogForm;
    }

    _notifyConfigurationDialogResize() {
        this.$.dialog.invalidateTabbables();
        this.$.dialog.notifyResize();
    }

    _isFieldVisible(field, selectedFlow, additionalField) {
        const flowMatches =
            selectedFlow &&
            RESTerAuthorizationProviderOAuth2ConfigurationDialog._configProperties[
                selectedFlow
            ].includes(field);
        if (!flowMatches) {
            return false;
        }

        // The client secret is not needed, when no authentication is performed.
        if (
            field === 'clientSecret' &&
            (!additionalField || additionalField === 'none')
        ) {
            return false;
        }

        return true;
    }

    _save() {
        if (this.$.dialogForm.validate()) {
            const flowProps =
                RESTerAuthorizationProviderOAuth2ConfigurationDialog
                    ._configProperties[this.data.flow];
            const notNeededProps = Object.keys(this.data).filter(
                key => !flowProps.includes(key)
            );
            for (const key of notNeededProps) {
                delete this.data[key];
            }

            this._closeDialogWithAction('save');
        }
    }

    _delete() {
        this._closeDialogWithAction('delete');
    }
}

customElements.define(
    RESTerAuthorizationProviderOAuth2ConfigurationDialog.is,
    RESTerAuthorizationProviderOAuth2ConfigurationDialog
);
