import { PolymerElement } from '../../../../node_modules/@polymer/polymer/polymer-element.js';
import {
    addListener as addGestureListener,
    removeListener as removeGestureListener
} from '../../../../node_modules/@polymer/polymer/lib/utils/gestures.js';
import { html } from '../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js';
import "../../../../node_modules/@polymer/paper-button/paper-button.js";
import "../../../../node_modules/@polymer/paper-input/paper-input-container.js";

/**
 * @polymer
 * @customElement
 */
class RESTerFileInput extends PolymerElement {
    static get template() {
        return html`
            <style>
                :host {
                    display: block;
                }

                input {
                    display: none;
                }

                .browse-button {
                    background-color: var(--primary-color);
                    margin: 4px 8px 4px 0;
                    padding: 4px 16px;
                }

                .placeholder {
                    color: var(--secondary-text-color);
                }
            </style>

            <paper-input-container no-label-float$="[[!label]]" always-float-label>
                <paper-button raised class="browse-button" slot="prefix">
                    Browse...
                </paper-button>
                <label hidden$="[[!label]]" aria-hidden="true" slot="label">[[label]]</label>
                <div slot="input">
                    <input id="input" type="file" name$="[[name]]" required$="[[required]]" on-change="_onInputChange">
                    <span hidden$="[[!value]]">[[value]]</span>
                    <span hidden$="[[value]]" class="placeholder">No file selected.</span>
                </div>
            </paper-input-container>
        `;
    }

    static get is() {
        return 'rester-file-input';
    }

    static get properties() {
        return {
            name: String,
            label: {
                type: String,
                value: null
            },
            required: {
                type: Boolean,
                value: false
            },
            file: {
                type: Object,
                notify: true,
                readOnly: true
            },
            value: {
                type: String,
                computed: '_computeValue(file, overrideValue)'
            },
            overrideValue: String
        };
    }

    constructor() {
        super();
        this._onClick = this._onClick.bind(this);
    }

    connectedCallback() {
        super.connectedCallback();
        addGestureListener(this, 'tap', this._onClick);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        removeGestureListener(this, 'tap', this._onClick);
    }

    _onClick() {
        this.$.input.click();
    }

    _computeValue(file, overrideValue) {
        if (overrideValue) {
            return overrideValue;
        } else if (file) {
            return file.name;
        } else {
            return false;
        }
    }

    _onInputChange() {
        this._setFile(this.$.input.files[0]);
        this.value = this.file ? this.file.name : '';
    }
}

customElements.define(RESTerFileInput.is, RESTerFileInput);
