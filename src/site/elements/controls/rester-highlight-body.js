import { PolymerElement } from '../../../../node_modules/@polymer/polymer/polymer-element.js';
import { html } from '../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js';
import '../../../../node_modules/@polymer/iron-icon/iron-icon.js';
import '../../../../node_modules/@polymer/paper-icon-button/paper-icon-button.js';
import '../../../../node_modules/@polymer/paper-item/paper-icon-item.js';
import '../../../../node_modules/@polymer/paper-item/paper-item.js';
import '../../../../node_modules/@polymer/paper-listbox/paper-listbox.js';
import '../../../../node_modules/@polymer/paper-menu-button/paper-menu-button.js';
import '../styles/rester-icons.js';
import './rester-ace-input.js';
import './rester-dom-purify-frame.js';
import dialogs from '../data/scripts/dialogs.js';
import { debounce, cancelDebounce } from '../../../shared/util.js';
import { formatCode } from '../data/scripts/worker.js';
import RESTerErrorMixin from '../utils/rester-error-mixin.js';
import RESTerSettingsMixin from '../data/rester-data-settings-mixin.js';

const aceModes = {
    Plain: 'ace/mode/text',
    HTML: 'ace/mode/html',
    JSON: 'ace/mode/json',
    XML: 'ace/mode/xml'
};

const prettyPrintModes = {
    JSON: 'json',
    XML: 'xml'
};

/**
 * @appliesMixin RESTerErrorMixin
 * @appliesMixin RESTerSettingsMixin
 * @polymer
 * @customElement
 */
class RESTerHighlightBody extends RESTerErrorMixin(
    RESTerSettingsMixin(PolymerElement)
) {
    static get template() {
        return html`
            <style>
                :host {
                    display: block;
                    position: relative;
                }

                #options {
                    position: absolute;
                    top: 0;
                    right: 16px; /* Make sure the scrollbar is clickable */
                    z-index: 10;
                    padding: 0;

                    --paper-menu: {
                        width: 256px;
                    };
                }

                .menu-item-divider {
                    border-top: 1px solid var(--divider-color);
                    margin: 4px 0;
                }
            </style>

            <paper-menu-button id="options" dynamic-align horizontal-align="right" restore-focus-on-close>
                <paper-icon-button slot="dropdown-trigger" icon="more-vert"></paper-icon-button>
                <paper-listbox slot="dropdown-content" selectable="[role='menuitemradio']">
                    <paper-icon-item role="menuitemcheckbox" on-tap="_toggleWrap">
                        <iron-icon slot="item-icon" icon="check" hidden$="[[!settings.responseBodyWrap]]"></iron-icon> Wrap
                    </paper-icon-item>
                    <paper-icon-item role="menuitemcheckbox" on-tap="_togglePrettyPrint" hidden$="[[!isPrettyPrintSupported]]">
                        <iron-icon slot="item-icon" icon="check" hidden$="[[!settings.responseBodyPrettyPrint]]"></iron-icon> Pretty Print
                    </paper-icon-item>
                    <paper-icon-item role="menuitemcheckbox" on-tap="_toggleFullSize">
                        <iron-icon slot="item-icon" icon="check" hidden$="[[!settings.responseBodyFullSize]]"></iron-icon> Full Size
                    </paper-icon-item>
                    <paper-icon-item role="menuitemcheckbox" on-tap="_togglePreview" hidden$="[[!isPreviewSupported]]">
                        <iron-icon slot="item-icon" icon="check" hidden$="[[!settings.responseBodyPreview]]"></iron-icon> Preview
                    </paper-icon-item>
                    <div class="menu-item-divider"></div>
                    <paper-icon-item on-tap="_changeLanguage">
                        <iron-icon slot="item-icon" icon="language"></iron-icon> Change highlighting ([[language]])
                    </paper-icon-item>
                </paper-listbox>
            </paper-menu-button>

            <template is="dom-if" if="[[!renderPreview]]">
                <rester-ace-input
                        mode="[[aceMode]]"
                        value="[[renderedBody]]"
                        use-wrap-mode="[[settings.responseBodyWrap]]"
                        read-only
                        max-lines="[[aceMaxLines]]"
                        disable-search="[[settings.responseBodyFullSize]]"></rester-ace-input>
            </template>
            <template is="dom-if" if="[[renderPreview]]">
                <rester-dom-purify-frame html="[[body]]"></rester-dom-purify-frame>
            </template>
        `;
    }

    static get is() {
        return 'rester-highlight-body';
    }

    static get properties() {
        return {
            body: String,
            bodyFormatted: {
                type: String,
                readOnly: true
            },
            renderedBody: {
                type: String,
                computed:
                    '_computeRenderedBody(body, bodyFormatted, settings.responseBodyPrettyPrint)'
            },
            contentType: String,
            language: String,
            aceMode: {
                type: String,
                computed: '_computeAceMode(language)'
            },
            aceMaxLines: {
                type: Number,
                computed: '_computeAceMaxLines(settings.responseBodyFullSize)'
            },
            prettyPrintMode: {
                type: String,
                computed: '_computePrettyPrintMode(language)'
            },
            isPrettyPrintSupported: {
                type: Boolean,
                computed: '_computeIsPrettyPrintSupported(prettyPrintMode)'
            },
            isPreviewSupported: {
                type: Boolean,
                computed: '_computeIsPreviewSupported(language)'
            },
            renderPreview: {
                type: Boolean,
                computed:
                    '_computeRenderPreview(settings.responseBodyPreview, isPreviewSupported)'
            }
        };
    }

    static get observers() {
        return [
            '_formatBody(body, prettyPrintMode)',
            '_autoSelectLanguage(contentType)'
        ];
    }

    constructor() {
        super();
        this._formatBodyWorker = undefined;
        this._startFormatBodyWorker = this._startFormatBodyWorker.bind(this);
    }

    _computeRenderedBody(body, bodyFormatted, prettyPrint) {
        if (prettyPrint && bodyFormatted) {
            return bodyFormatted;
        } else {
            return body;
        }
    }

    _computeAceMode(language) {
        return aceModes[language] || null;
    }

    _computeAceMaxLines(fullSize) {
        return fullSize ? Infinity : 25;
    }

    _computePrettyPrintMode(language) {
        return prettyPrintModes[language] || null;
    }

    _computeIsPrettyPrintSupported(prettyPrintMode) {
        return !!prettyPrintMode;
    }

    _computeIsPreviewSupported(language) {
        return language === 'HTML';
    }

    _computeRenderPreview(preview, isPreviewSupported) {
        return preview && isPreviewSupported;
    }

    _formatBody(body, prettyPrintMode) {
        this._setBodyFormatted('');
        if (this._formatBodyWorker) {
            this._formatBodyWorker.cancel();
            this._formatBodyWorker = undefined;
        }

        if (!body || !prettyPrintMode) {
            cancelDebounce(this._startFormatBodyWorker);
            return;
        }

        debounce(this._startFormatBodyWorker, 100, body, prettyPrintMode);
    }

    _startFormatBodyWorker(body, prettyPrintMode) {
        this._formatBodyWorker = formatCode.run({
            code: body,
            language: prettyPrintMode
        });

        this._formatBodyWorker.then(result => {
            this._formatBodyWorker = undefined;
            this._setBodyFormatted(result);
        });

        this._formatBodyWorker.catch(error => {
            this._formatBodyWorker = undefined;
            this.showError(error);
        });
    }

    _autoSelectLanguage(contentType) {
        let newLanguage = 'Plain';
        if (contentType) {
            if (contentType.toLowerCase().includes('json')) {
                newLanguage = 'JSON';
            } else if (contentType.toLowerCase().includes('html')) {
                newLanguage = 'HTML';
            } else if (contentType.toLowerCase().includes('xml')) {
                newLanguage = 'XML';
            }
        }

        this.language = newLanguage;
    }

    _toggleWrap() {
        this.$.options.close();
        this.settings.responseBodyWrap = !this.settings.responseBodyWrap;
    }

    _togglePrettyPrint() {
        this.$.options.close();
        this.settings.responseBodyPrettyPrint = !this.settings
            .responseBodyPrettyPrint;
    }

    _toggleFullSize() {
        this.$.options.close();
        this.settings.responseBodyFullSize = !this.settings
            .responseBodyFullSize;
    }

    _togglePreview() {
        this.$.options.close();
        this.settings.responseBodyPreview = !this.settings.responseBodyPreview;
    }

    _changeLanguage() {
        this.$.options.close();
        dialogs.highlightLanguageSelect.show(this.language).then(result => {
            if (result.reason.confirmed) {
                this.language = result.data;
            }
        });
    }
}

customElements.define(RESTerHighlightBody.is, RESTerHighlightBody);
