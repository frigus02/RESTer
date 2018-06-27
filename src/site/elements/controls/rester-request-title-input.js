import { PolymerElement } from '../../../../node_modules/@polymer/polymer/polymer-element.js';
import { html } from '../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js';
import "../../../../node_modules/@polymer/iron-input/iron-input.js";
import "../../../../node_modules/@polymer/paper-input/paper-input-container.js";
import "./rester-autocomplete.js";
import resterPaperInputStyle from "../styles/rester-paper-input.js";
import { getRequestCollections } from '../data/scripts/rester.js';

/**
 * @polymer
 * @customElement
 */
class RESTerRequestTitleInput extends PolymerElement {
    static get template() {
        return html`
            ${resterPaperInputStyle}

            <style>
                :host {
                    display: block;

                    --paper-input-container-focus-color: var(--accent-color);
                }

                input {
                    font-size: 20px;
                }

                #label {
                    position: absolute;
                    pointer-events: none;
                    font-size: 20px;
                    color: var(--secondary-text-color);
                }

                #label .size-helper {
                    visibility: hidden;
                }
            </style>

            <paper-input-container no-label-float>
                <div slot="label" id="label">
                    <span class="size-helper">[[value]]</span>
                    <span hidden$="[[hasCollection]]">Collection</span>
                    <span hidden$="[[hasTitle]]"><span hidden$="[[hasTrailingSlash]]">/</span> Title</span>
                </div>
                <iron-input slot="input"
                        id="input"
                        bind-value="{{value}}">
                    <input id="nativeInput"
                            autocomplete="off"
                            name="[[name]]"
                            required$="[[required]]">
                </iron-input>
                <rester-autocomplete
                        slot="suffix"
                        for="nativeInput"
                        items="[[requestCollections]]"></rester-autocomplete>
            </paper-input-container>
        `;
    }

    static get is() {
        return 'rester-request-title-input';
    }

    static get properties() {
        return {
            requestCollection: {
                type: String,
                notify: true,
                observer: '_onRequestTitleChanged'
            },
            requestTitle: {
                type: String,
                notify: true,
                observer: '_onRequestTitleChanged'
            },
            name: String,
            required: {
                type: Boolean,
                value: false
            },
            value: {
                type: String,
                observer: '_onValueChanged'
            },
            requestCollections: {
                type: Array,
                readOnly: true
            },
            hasCollection: {
                type: Boolean,
                computed: '_computeHasCollection(requestCollection)'
            },
            hasTrailingSlash: {
                type: Boolean,
                computed: '_computeHasTrailingSlash(value)'
            },
            hasTitle: {
                type: Boolean,
                computed: '_computeHasTitle(requestTitle)'
            }
        };
    }

    constructor() {
        super();
        this._knownCollection =  undefined;
        this._knownTitle =  undefined;
    }

    ready() {
        super.ready();

        this._onInputKeyDown = this._onInputKeyDown.bind(this);

        getRequestCollections().then(result => {
            this._setRequestCollections(result.map(c => c + ' / '));
        });
    }

    connectedCallback() {
        super.connectedCallback();
        this.$.nativeInput.addEventListener('keydown', this._onInputKeyDown);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.$.nativeInput.removeEventListener('keydown', this._onInputKeyDown);
    }

    _onRequestTitleChanged() {
        if (this.requestCollection !== this._knownCollection ||
            this.requestTitle !== this._knownTitle) {
            this._knownCollection = this.requestCollection;
            this._knownTitle = this.requestTitle;

            if (this._knownTitle && this._knownCollection) {
                this.value = `${this.requestCollection} / ${this.requestTitle}`;
            } else {
                this.value = '';
            }
        }
    }

    _onValueChanged() {
        const parts = this.value.split('/');

        if (parts.length > 1) {
            this._knownTitle = parts.pop().trim();
        } else {
            this._knownTitle = '';
        }

        this.requestTitle = this._knownTitle;

        this._knownCollection = parts.map(p => p.trim()).filter(p => p).join(' / ');
        this.requestCollection = this._knownCollection;
    }

    _computeHasCollection(requestCollection) {
        return !!requestCollection;
    }

    _computeHasTrailingSlash(value) {
        return (value || '').trim().endsWith('/');
    }

    _computeHasTitle(requestTitle) {
        return !!requestTitle;
    }

    _onInputKeyDown(e) {
        const caretPos = this.$.nativeInput.selectionStart;
        const isSelection = this.$.nativeInput.selectionStart !== this.$.nativeInput.selectionEnd;
        const value = this.$.nativeInput.value;

        if (e.key === 'Backspace') {
            if (!isSelection && value.substr(caretPos - 3, 3) === ' / ') {
                this.value = value.substr(0, caretPos - 2) + value.substr(caretPos);
                this.$.nativeInput.setSelectionRange(caretPos - 2, caretPos - 2);
            }
        } else if (e.keyCode === 'Delete') {
            if (!isSelection && value.substr(caretPos, 3) === ' / ') {
                this.value = value.substr(0, caretPos) + value.substr(caretPos + 2);
                this.$.nativeInput.setSelectionRange(caretPos, caretPos);
            }
        } else if (e.key === '/') {
            e.preventDefault();

            let strToInsert = ' / ',
                newValue = value.substring(0, this.$.nativeInput.selectionStart) + value.substring(this.$.nativeInput.selectionEnd);

            if (newValue.substr(caretPos - 1, 1) === ' ') {
                strToInsert = strToInsert.trimLeft();
            }
            if (newValue.substr(caretPos, 1) === ' ') {
                strToInsert = strToInsert.trimRight();
            }

            this.value = newValue.substr(0, caretPos) + strToInsert + newValue.substr(caretPos);
            this.$.nativeInput.setSelectionRange(caretPos + strToInsert.length, caretPos + strToInsert.length);
        }
    }
}

customElements.define(RESTerRequestTitleInput.is, RESTerRequestTitleInput);
