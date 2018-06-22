import { PolymerElement } from '../../../../node_modules/@polymer/polymer/polymer-element.js';
import { html } from '../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js';
import "../../../../node_modules/iron-input/iron-input.js";
import "../../../../node_modules/paper-input/paper-input-container.js";
import "../styles/rester-paper-input-styles.js";
import "./rester-autocomplete.js";

/**
 * @polymer
 * @customElement
 */
class RESTerAutocompleteInput extends PolymerElement {
    static get template() {
        return html`
            <style include="rester-paper-input-styles">
                :host {
                    display: block;
                }
            </style>

            <paper-input-container
                    no-label-float="[[noLabelFloat]]"
                    invalid="[[invalid]]"
                    disabled$="[[disabled]]">
                <label slot="label" for="input">[[label]]</label>
                <iron-input slot="input"
                        id="input"
                        bind-value="{{value}}"
                        invalid="{{invalid}}">
                    <input id="nativeInput"
                            placeholder$="[[placeholder]]"
                            autocomplete="off"
                            name$="[[name]]"
                            autofocus$="[[autofocus]]"
                            required$="[[required]]"
                            disabled$="[[disabled]]">
                </iron-input>
                <rester-autocomplete
                        slot="suffix"
                        for="nativeInput"
                        items="[[items]]"
                        dropdown-items-visible="[[dropdownItemsVisible]]"
                        sort-by-index="[[sortByIndex]]"></rester-autocomplete>
            </paper-input-container>
        `;
    }

    static get is() {
        return 'rester-autocomplete-input';
    }

    static get properties() {
        return {
            name: String,
            placeholder: String,
            label: String,
            autofocus: Boolean,
            noLabelFloat: Boolean,
            value: {
                type: String,
                notify: true
            },
            items: {
                type: Array,
                value: []
            },
            dropdownItemsVisible: {
                type: Number,
                value: 4.7
            },
            sortByIndex: {
                type: Boolean,
                value: false
            },
            invalid: {
                type: Boolean,
                value: false,
                notify: true
            },
            required: {
                type: Boolean,
                value: false
            },
            disabled: Boolean
        };
    }

    validate() {
        return this.$.input.validate();
    }
}

customElements.define(RESTerAutocompleteInput.is, RESTerAutocompleteInput);
