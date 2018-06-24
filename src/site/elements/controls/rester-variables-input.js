import { PolymerElement } from '../../../../node_modules/@polymer/polymer/polymer-element.js';
import { html } from '../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js';
import "../../../../node_modules/@polymer/paper-input/paper-input.js";
import "../../../../node_modules/@polymer/paper-toggle-button/paper-toggle-button.js";
import "./rester-autocomplete-input.js";
import {
    getHistoryEntries,
    e as resterEvents
} from '../data/scripts/rester.js';
import { debounce } from '../../../shared/util.js';
import { extract } from '../data/scripts/variables.js';
import RESTerVariablesMixin from '../data/rester-data-variables-mixin.js';

/**
 * @appliesMixin RESTerVariablesMixin
 * @polymer
 * @customElement
 */
class RESTerVariablesInput extends RESTerVariablesMixin(PolymerElement) {
    static get template() {
        return html`
            <style include="rester-hint">
                :host {
                    display: block;
                }
            </style>

            <p class="hint">
                You can use placeholders everywhere in the request with curly brackets,
                e.g. <code>{id}</code> or <code>{title}</code>. Below you see input fields
                for each of these variables.
            </p>

            <template is="dom-repeat" items="[[variables]]" sort="_compareVariables">
                <rester-autocomplete-input
                        label="[[item.name]]"
                        value="{{item.value}}"
                        on-value-changed="_onVariableValueChanged"
                        items="[[item.history]]"
                        sort-by-index></rester-autocomplete-input>
            </template>
            <template is="dom-repeat" items="[[providedVariables]]" sort="_compareVariables">
                <paper-input
                        label="[[item.name]]"
                        value="{{item.value}}"
                        disabled></paper-input>
            </template>
        `;
    }

    static get is() {
        return 'rester-variables-input';
    }

    static get properties() {
        return {
            value: {
                type: Object,
                notify: true,
                observer: '_updateVariablesDebounced'
            },
            sourceObj: {
                type: Object
            },
            variables: {
                type: Array,
                readOnly: true
            },
            providedVariables: {
                type: Array,
                readOnly: true
            },
            lastUsedVariables: {
                type: Object,
                readOnly: true
            },
            variableHistory: {
                type: Object,
                readOnly: true
            }
        };
    }

    static get observers() {
        return [
            '_updateVariablesDebounced(sourceObj.*, providedVariableValues)'
        ];
    }

    constructor() {
        super();
        this._onDataChanges = this._onDataChanges.bind(this);
        this._updateVariables = this._updateVariables.bind(this);
    }

    connectedCallback() {
        super.connectedCallback();

        this._setLastUsedVariables({});
        this._setVariableHistory({});

        getHistoryEntries(25, ['request.variables.values']).then(entries => {
            entries.reverse();
            for (let entry of entries) {
                this._addHistoryEntryToVariableHistory(entry);
            }
        });

        resterEvents.addEventListener('dataChange', this._onDataChanges);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        resterEvents.removeEventListener('dataChange', this._onDataChanges);
    }

    _updateVariablesDebounced() {
        if (!this.value) {
            this.value = {};
        }

        debounce(this._updateVariables, 300);
    }

    _updateVariables() {
        const allVarNames = extract(this.sourceObj);
        const varNames = allVarNames.filter(n => !n.startsWith('$'));
        const providedVarNames = allVarNames.filter(n => n.startsWith('$'));
        const values = this.value || {};

        for (let varName of varNames) {
            if (this.value[varName]) {
                this.set(['lastUsedVariables', varName], this.value[varName]);
            } else if (this.lastUsedVariables[varName]) {
                this.set(['value', varName], this.lastUsedVariables[varName]);
            } else if (this.variableHistory[varName]) {
                this.set(['lastUsedVariables', varName], this.variableHistory[varName][0]);
                this.set(['value', varName], this.variableHistory[varName][0]);
            } else {
                this.set(['value', varName], '');
            }
        }

        this._setVariables(varNames.map(varName => ({
            name: varName,
            value: values[varName],
            history: this.variableHistory[varName] || []
        })));

        this._setProvidedVariables(providedVarNames.map(varName => ({
            name: varName,
            value: this.providedVariableValues[varName]
        })));
    }

    _onVariableValueChanged(e) {
        const variable = e.model.item;
        const newValue = e.detail.value;
        if (!variable) {
            return;
        }

        if (!this.value) {
            this.value = { [variable.name]: newValue };
        } else {
            this.set(['value', variable.name], newValue);
        }

        this.set(['lastUsedVariables', variable.name], newValue);
    }

    _onDataChanges(e) {
        for (let change of e.detail) {
            if (change.itemType === 'HistoryEntry' && change.action === 'add') {
                this._addHistoryEntryToVariableHistory(change.item);
            }
        }
    }

    _addHistoryEntryToVariableHistory(entry) {
        const values = entry.request.variables.values || {};
        for (let name in values) {
            if (values.hasOwnProperty(name)) {
                if (!this.variableHistory.hasOwnProperty(name)) {
                    this.set(['variableHistory', name], [values[name]]);
                } else {
                    const index = this.variableHistory[name].indexOf(values[name]);
                    if (index > -1) {
                        this.splice(['variableHistory', name], index, 1);
                    }

                    this.unshift(['variableHistory', name], values[name]);
                }

                // Update the history property in the variable item, which is used
                // in the dom-repeat element.
                if (this.variables) {
                    const index = this.variables.findIndex(v => v.name === name);
                    if (index > -1) {
                        this.set(['variables', index, 'history'], []);
                        this.set(['variables', index, 'history'], this.variableHistory[name]);
                    }
                }
            }
        }
    }

    _compareVariables(a, b) {
        return a.name.localeCompare(b.name);
    }
}

customElements.define(RESTerVariablesInput.is, RESTerVariablesInput);
