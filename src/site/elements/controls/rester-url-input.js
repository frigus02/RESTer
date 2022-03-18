import { PolymerElement } from '../../../../node_modules/@polymer/polymer/polymer-element.js';
import { html } from '../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js';
import '../../../../node_modules/@polymer/paper-icon-button/paper-icon-button.js';
import '../../../../node_modules/@polymer/paper-input/paper-input.js';
import '../../../../node_modules/@polymer/paper-tooltip/paper-tooltip.js';
import '../styles/rester-icons.js';
import './rester-form-data-input.js';

/**
 * @polymer
 * @customElement
 */
class RESTerUrlInput extends PolymerElement {
    static get template() {
        return html`
            <style>
                :host {
                    display: flex;
                    flex-direction: row;
                    align-items: flex-start;
                    justify-content: space-between;
                }

                .flex {
                    flex: 1;
                }

                .expand-button {
                    margin-top: 19px;
                    transition: transform 0.25s ease;
                }

                :host([expanded]) .expand-button {
                    transform: rotate(-180deg);
                }
            </style>

            <div hidden$="[[expanded]]" class="flex">
                <paper-input
                    id="inputAbsolute"
                    value="{{value}}"
                    name="[[name]]"
                    invalid="{{invalid}}"
                    label="[[label]]"
                    required$="[[required]]"
                >
                </paper-input>
            </div>

            <div hidden$="[[!expanded]]" class="flex">
                <paper-input
                    id="inputOriginAndPath"
                    value="[[originAndPath]]"
                    on-value-changed="_onOriginAndPathChanged"
                    label="[[label]]"
                >
                </paper-input>
                <rester-form-data-input
                    value="[[query]]"
                    on-value-changed="_onQueryChanged"
                    text-only
                ></rester-form-data-input>
            </div>

            <paper-icon-button
                id="toggle-url-params-button"
                aria-label="Toggle URL params"
                icon="expand-more"
                class="expand-button"
                on-tap="_toggleExpanded"
            ></paper-icon-button>
            <paper-tooltip for="toggle-url-params-button" animation-delay="300"
                >Toggle URL params</paper-tooltip
            >
        `;
    }

    static get is() {
        return 'rester-url-input';
    }

    static get properties() {
        return {
            label: String,
            name: String,
            value: {
                type: String,
                notify: true,
                observer: '_onValueChanged',
            },
            required: {
                type: Boolean,
                value: false,
            },
            originAndPath: {
                type: String,
            },
            query: {
                type: String,
            },
            expanded: {
                type: Boolean,
                value: false,
                reflectToAttribute: true,
            },
            invalid: {
                type: Boolean,
                value: false,
                notify: true,
            },
        };
    }

    _toggleExpanded() {
        this.expanded = !this.expanded;
        setTimeout(() => {
            if (this.expanded) {
                this.$.inputAbsolute.focus();
            } else {
                this.$.inputOriginAndPath.focus();
            }
        });
    }

    _onValueChanged() {
        const parts = this.value.split('?');
        this.originAndPath = parts[0];
        this.query = parts[1] || '';
    }

    _onOriginAndPathChanged(event) {
        this.originAndPath = event.detail.value;
        this._updateValueFromOriginAndPathAndQuery();
    }

    _onQueryChanged(event) {
        this.query = event.detail.value;
        this._updateValueFromOriginAndPathAndQuery();
    }

    _updateValueFromOriginAndPathAndQuery() {
        let url = this.originAndPath;
        if (this.query) {
            url += '?' + this.query;
        }

        this.value = url;
    }

    validate() {
        return this.$.inputAbsolute.validate();
    }
}

customElements.define(RESTerUrlInput.is, RESTerUrlInput);
