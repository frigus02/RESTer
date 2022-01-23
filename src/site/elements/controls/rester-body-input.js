import { PolymerElement } from '../../../../node_modules/@polymer/polymer/polymer-element.js';
import { html } from '../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js';
import '../../../../node_modules/@polymer/iron-icon/iron-icon.js';
import '../../../../node_modules/@polymer/paper-icon-button/paper-icon-button.js';
import '../../../../node_modules/@polymer/paper-item/paper-icon-item.js';
import '../../../../node_modules/@polymer/paper-item/paper-item.js';
import '../../../../node_modules/@polymer/paper-listbox/paper-listbox.js';
import '../../../../node_modules/@polymer/paper-menu-button/paper-menu-button.js';
import vkbeautify from '../../../../node_modules/frigus02-vkbeautify/vkbeautify.js';
import '../styles/rester-icons.js';
import './rester-ace-input.js';
import './rester-form-data-input.js';
import RESTerSettingsMixin from '../data/rester-data-settings-mixin.js';
import { formatJson } from '../data/scripts/format-json.js';

/**
 * @appliesMixin RESTerSettingsMixin
 * @polymer
 * @customElement
 */
class RESTerBodyInput extends RESTerSettingsMixin(PolymerElement) {
    static get template() {
        return html`
            <style>
                :host {
                    display: block;
                    position: relative;
                }

                #options {
                    position: absolute;
                    top: 8px;
                    right: 16px; /* Make sure the scrollbar is clickable */
                    z-index: 10;
                    padding: 0;
                    background-color: var(--primary-background-color);

                    --paper-menu: {
                        width: 256px;
                    }
                }

                .menu-item-divider {
                    border-top: 1px solid var(--divider-color);
                    margin: 4px 0;
                }

                rester-ace-input {
                    padding-top: 8px;
                }

                rester-form-data-input {
                    margin-right: 40px;
                }
            </style>

            <paper-menu-button
                id="options"
                horizontal-align="right"
                restore-focus-on-close
            >
                <paper-icon-button
                    slot="dropdown-trigger"
                    icon="more-vert"
                ></paper-icon-button>
                <paper-listbox
                    slot="dropdown-content"
                    selectable="[role='menuitemradio']"
                >
                    <template is="dom-repeat" items="[[inputOptions]]">
                        <paper-icon-item
                            role="menuitemradio"
                            on-tap="_selectInputOption"
                        >
                            <iron-icon
                                slot="item-icon"
                                icon="check"
                                hidden$="[[!_isInputOptionSelected(item, selectedInputOption)]]"
                            ></iron-icon>
                            [[item.title]]
                        </paper-icon-item>
                    </template>
                    <div
                        class="menu-item-divider"
                        hidden$="[[!selectedInputOption.isInputTypeAce]]"
                    ></div>
                    <paper-icon-item
                        role="menuitemcheckbox"
                        hidden$="[[!selectedInputOption.isInputTypeAce]]"
                        on-tap="_toggleFullSize"
                    >
                        <iron-icon
                            slot="item-icon"
                            icon="check"
                            hidden$="[[!settings.requestBodyFullSize]]"
                        ></iron-icon>
                        Full Size
                    </paper-icon-item>
                    <div
                        class="menu-item-divider"
                        hidden$="[[!selectedInputOption.beautifyMethod]]"
                    ></div>
                    <paper-icon-item
                        role="menuitem"
                        hidden$="[[!selectedInputOption.beautifyMethod]]"
                        on-tap="_beautify"
                    >
                        <iron-icon
                            slot="item-icon"
                            icon="format-paint"
                        ></iron-icon>
                        Beautify
                    </paper-icon-item>
                </paper-listbox>
            </paper-menu-button>

            <template
                is="dom-if"
                if="[[selectedInputOption.isInputTypeAce]]"
                restamp
            >
                <rester-ace-input
                    mode="[[selectedInputOption.aceMode]]"
                    value="{{value}}"
                    max-lines="[[aceMaxLines]]"
                    disable-search="[[settings.requestBodyFullSize]]"
                >
                </rester-ace-input>
            </template>

            <template
                is="dom-if"
                if="[[selectedInputOption.isInputTypeForm]]"
                restamp
            >
                <rester-form-data-input value="{{value}}" files="{{files}}">
                </rester-form-data-input>
            </template>
        `;
    }

    static get is() {
        return 'rester-body-input';
    }

    static get properties() {
        return {
            value: {
                type: String,
                notify: true,
                value: '',
            },
            files: {
                type: Object,
            },
            contentType: {
                type: String,
                observer: '_onContentTypeChanged',
            },
            inputOptions: {
                type: Array,
                readOnly: true,
                value: [
                    {
                        title: 'Plain',
                        isInputTypeAce: true,
                        contentTypeSearch: ['plain'],
                        aceMode: 'ace/mode/text',
                    },
                    {
                        title: 'JSON',
                        isInputTypeAce: true,
                        contentTypeSearch: ['json'],
                        aceMode: 'ace/mode/json',
                        beautifyMethod: 'json',
                    },
                    {
                        title: 'XML',
                        isInputTypeAce: true,
                        contentTypeSearch: ['xml'],
                        aceMode: 'ace/mode/xml',
                        beautifyMethod: 'xml',
                    },
                    {
                        title: 'Form',
                        isInputTypeForm: true,
                        contentTypeSearch: [
                            'x-www-form-urlencoded',
                            'form-data',
                        ],
                    },
                ],
            },
            selectedInputOption: Object,
            aceMaxLines: {
                type: Number,
                computed: '_computeAceMaxLines(settings.requestBodyFullSize)',
            },
        };
    }

    ready() {
        super.ready();
        this.selectedInputOption = this.inputOptions[0];
    }

    getSuggestedContentType() {
        if (this.selectedInputOption.title === 'JSON') {
            return 'application/json';
        } else if (this.selectedInputOption.title === 'XML') {
            return 'application/xml';
        } else if (this.selectedInputOption.title === 'Form') {
            return this.files && Object.keys(this.files).length > 0
                ? 'multipart/form-data'
                : 'application/x-www-form-urlencoded';
        }
    }

    maybeEncodeVariableValue(value) {
        if (this.selectedInputOption.title === 'Form') {
            return encodeURIComponent(value);
        }

        return value;
    }

    notifyVisibilityChanged() {
        if (this.selectedInputOption.isInputTypeAce) {
            this.shadowRoot
                .querySelector('rester-ace-input')
                .notifyVisibilityChanged();
        }
    }

    _computeAceMaxLines(fullSize) {
        return fullSize ? Infinity : 20;
    }

    _onContentTypeChanged() {
        const lowerContentType = (this.contentType || '').toLowerCase();
        const newOption = this.inputOptions.find(
            (option) =>
                option.contentTypeSearch &&
                option.contentTypeSearch.some((search) =>
                    lowerContentType.includes(search)
                )
        );

        if (newOption) {
            this.selectedInputOption = newOption;
        }
    }

    _isInputOptionSelected(option, selectedInputOption) {
        return selectedInputOption === option;
    }

    _selectInputOption(e) {
        this.selectedInputOption = e.model.item;
    }

    _toggleFullSize() {
        this.$.options.close();
        this.settings.requestBodyFullSize = !this.settings.requestBodyFullSize;
    }

    _beautify() {
        this.$.options.close();
        if (this.selectedInputOption.beautifyMethod === 'json') {
            this.value = formatJson(this.value);
        } else if (this.selectedInputOption.beautifyMethod === 'xml') {
            this.value = vkbeautify.xml(this.value, 4);
        }
    }
}

customElements.define(RESTerBodyInput.is, RESTerBodyInput);
