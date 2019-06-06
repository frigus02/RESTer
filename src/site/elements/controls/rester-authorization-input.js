import { PolymerElement } from '../../../../node_modules/@polymer/polymer/polymer-element.js';
import { html } from '../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js';
import '../../../../node_modules/@polymer/iron-icon/iron-icon.js';
import '../../../../node_modules/@polymer/paper-icon-button/paper-icon-button.js';
import '../../../../node_modules/@polymer/paper-item/paper-icon-item.js';
import '../../../../node_modules/@polymer/paper-item/paper-item-body.js';
import '../../../../node_modules/@polymer/paper-item/paper-item.js';
import '../styles/rester-icons.js';
import resterPaperItemButtonStyle from '../styles/rester-paper-item-button.js';
import './rester-authorization-provider-basic.js';
import './rester-authorization-provider-cookie.js';
import './rester-authorization-provider-custom.js';
import './rester-authorization-provider-oauth2.js';
import { truncate } from '../data/scripts/encode.js';
import { expirationDate } from '../data/scripts/format.js';
import {
    addAuthorizationToken,
    deleteAuthorizationProviderConfiguration,
    deleteAuthorizationToken,
    getAuthorizationProviderConfigurations,
    getAuthorizationTokens,
    putAuthorizationProviderConfiguration
} from '../data/scripts/rester.js';
import { clone } from '../../../shared/util.js';
import RESTerErrorMixin from '../utils/rester-error-mixin.js';

/**
 * @appliesMixin RESTerErrorMixin
 * @polymer
 * @customElement
 */
class RESTerAuthorizationInput extends RESTerErrorMixin(PolymerElement) {
    static get template() {
        return html`
            ${resterPaperItemButtonStyle}

            <style>
                :host {
                    display: block;
                }

                paper-item-body div {
                    white-space: initial;
                    word-break: break-all;
                }
            </style>

            <div hidden$="[[!tokens.length]]">
                <h3>Use existing tokens</h3>
                <template is="dom-repeat" items="[[tokens]]">
                    <paper-icon-item role="menuitemradio" class="button">
                        <iron-icon
                            slot="item-icon"
                            icon="check"
                            hidden$="[[!item.isUsed]]"
                        ></iron-icon>
                        <paper-item-body three-line on-tap="_useToken">
                            <div>[[_truncateTokenTitle(item.token.title)]]</div>
                            <div secondary>
                                [[item.provider.title]]<span
                                    hidden$="[[!item.configurationId]]"
                                    >: [[item.configuration.title]]</span
                                >
                            </div>
                            <div secondary>
                                [[item.expirationDateFormatted]]
                            </div>
                        </paper-item-body>
                        <paper-icon-button
                            icon="delete"
                            aria-label="Delete token"
                            on-tap="_deleteToken"
                        ></paper-icon-button>
                    </paper-icon-item>
                </template>
            </div>

            <div hidden$="[[!configurations.length]]">
                <h3>Generate new token</h3>
                <template
                    is="dom-repeat"
                    items="[[configurations]]"
                    sort="_compareConfigurations"
                >
                    <paper-item class="button">
                        <paper-item-body
                            two-line
                            on-tap="_generateTokenFromConfig"
                        >
                            <div>[[item.provider.title]]</div>
                            <div secondary>[[item.configuration.title]]</div>
                        </paper-item-body>
                        <paper-icon-button
                            icon="visibility-off"
                            aria-label="Generate token incognito"
                            on-tap="_generateTokenFromConfigIncognito"
                            hidden$="[[!item.provider.supportsIncognito]]"
                        ></paper-icon-button>
                        <paper-icon-button
                            icon="edit"
                            aria-label="Edit configuration"
                            on-tap="_editConfiguration"
                            hidden$="[[!item.configuration.id]]"
                        ></paper-icon-button>
                    </paper-item>
                </template>
            </div>

            <div hidden$="[[!providers.length]]">
                <h3>Create new configuration</h3>
                <template is="dom-repeat" items="[[providers]]">
                    <paper-item class="button" on-tap="_createConfiguration">
                        <paper-item-body>
                            <div>[[item.title]]</div>
                        </paper-item-body>
                    </paper-item>
                </template>
            </div>

            <rester-authorization-provider-custom
                id="providerCustom"
            ></rester-authorization-provider-custom>
            <rester-authorization-provider-cookie
                id="providerCookie"
            ></rester-authorization-provider-cookie>
            <rester-authorization-provider-basic
                id="providerBasic"
            ></rester-authorization-provider-basic>
            <rester-authorization-provider-oauth2
                id="providerOAuth2"
            ></rester-authorization-provider-oauth2>
        `;
    }

    static get is() {
        return 'rester-authorization-input';
    }

    static get properties() {
        return {
            authorization: {
                type: Object,
                notify: true,
                observer: '_onAuthorizationChanged'
            },
            tokens: {
                type: Array,
                readOnly: true,
                value: []
            },
            configurations: {
                type: Array,
                readOnly: true,
                value: []
            },
            providers: {
                type: Array,
                readOnly: true,
                value: []
            }
        };
    }

    ready() {
        super.ready();

        const allProviders = [
            this.$.providerCustom,
            this.$.providerCookie,
            this.$.providerBasic,
            this.$.providerOAuth2
        ];

        this._setTokens([]);
        this._setConfigurations([]);
        this._setProviders([]);

        const configPromises = [];

        allProviders.forEach(provider => {
            if (provider.needsConfiguration) {
                this.push('providers', provider);

                configPromises.push(
                    getAuthorizationProviderConfigurations(
                        provider.providerId
                    ).then(configurations => {
                        configurations.forEach(configuration => {
                            this.push('configurations', {
                                provider,
                                configuration
                            });
                        });
                    })
                );
            } else {
                this.push('configurations', {
                    provider,
                    configuration: {
                        id: 0,
                        title: '',
                        providerId: provider.providerId
                    }
                });
            }
        });

        Promise.all(configPromises).then(() => {
            getAuthorizationTokens().then(tokens => {
                this._setTokens(
                    tokens.map(token => this._prepareTokenForRender(token))
                );
                this._updateTokenIsUsedFlag();
            });
        });
    }

    _onAuthorizationChanged() {
        this._updateTokenIsUsedFlag();
    }

    _generateTokenFromConfig(e) {
        this._generateToken(e.model.item);
    }

    _generateTokenFromConfigIncognito(e) {
        this._generateToken(e.model.item, true);
    }

    async _generateToken(config, incognito) {
        const provider = config.provider;
        const configuration = clone(config.configuration);
        configuration.incognito = !!incognito;

        try {
            const token = await provider.generateToken(configuration);
            token.providerId = configuration.providerId;
            token.configurationId = configuration.id;
            const id = await addAuthorizationToken(token);
            token.id = id;
            const renderToken = this._prepareTokenForRender(token);
            this.push('tokens', renderToken);
            this.authorization = {
                scheme: token.scheme,
                token: token.token
            };
        } catch (error) {
            if (error) {
                this.showError(error);
            }
        }
    }

    _useToken(e) {
        const token = e.model.item;

        if (token.isUsed) {
            this.authorization = null;
        } else {
            this.authorization = {
                scheme: token.token.scheme,
                token: token.token.token
            };
        }
    }

    async _deleteToken(e) {
        const token = e.model.item;

        if (token.isUsed) {
            this.authorization = null;
        }

        await deleteAuthorizationToken(token.token.id);
        const index = this.tokens.indexOf(token);
        if (index > -1) {
            this.splice('tokens', index, 1);
        }
    }

    async _editConfiguration(e) {
        const config = e.model.item;
        const provider = config.provider;
        const configuration = clone(config.configuration);

        try {
            const newConfig = await provider.editConfiguration(configuration);
            if (newConfig === 'delete') {
                await deleteAuthorizationProviderConfiguration(
                    configuration.id
                );
                const index = this.configurations.indexOf(config);
                if (index > 0) {
                    this.splice('configurations', index, 1);
                }
            } else {
                await putAuthorizationProviderConfiguration(newConfig);
                config.configuration = newConfig;

                const index = this.configurations.indexOf(config);
                this.notifyPath(['configurations', index, 'configuration']);
            }
        } catch (e) {
            // User pressed cancel
        }
    }

    async _createConfiguration(e) {
        const provider = e.model.item;

        try {
            const config = await provider.createConfiguration();
            const id = await putAuthorizationProviderConfiguration(config);
            config.id = id;
            this.push('configurations', {
                provider,
                configuration: config
            });
        } catch (e) {
            // User pressed cancel
        }
    }

    _prepareTokenForRender(token) {
        const config = this.configurations.find(
            c =>
                c.configuration.providerId === token.providerId &&
                c.configuration.id === token.configurationId
        );
        return {
            token,
            configuration: config.configuration,
            provider: config.provider,
            expirationDateFormatted: expirationDate(token.expirationDate),
            isUsed: false
        };
    }

    _updateTokenIsUsedFlag() {
        this.tokens.forEach((token, i) => {
            this.set(
                ['tokens', i, 'isUsed'],
                this.authorization &&
                    this.authorization.scheme === token.token.scheme &&
                    this.authorization.token === token.token.token
            );
        });
    }

    _compareConfigurations(a, b) {
        const providerCompare = a.provider.title.localeCompare(
            b.provider.title
        );
        if (providerCompare === 0) {
            return a.configuration.title.localeCompare(b.configuration.title);
        } else {
            return providerCompare;
        }
    }

    _truncateTokenTitle(title) {
        return truncate(title, 100);
    }
}

customElements.define(RESTerAuthorizationInput.is, RESTerAuthorizationInput);
