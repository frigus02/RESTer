import {
    providedValues,
    e as variablesEvents
} from '../data/scripts/variables.js';

/**
 * @polymer
 * @mixinFunction
 *
 * Makes RESTer provided variable values available in property `providedVariableValues`.
 */
const RESTerVariablesMixin = superclass =>
    class extends superclass {
        static get properties() {
            return {
                providedVariableValues: {
                    type: Object,
                    readOnly: true
                }
            };
        }

        constructor() {
            super();
            this._onProvidedValuesChanged = this._onProvidedValuesChanged.bind(
                this
            );
        }

        connectedCallback() {
            this._setProvidedVariableValues(providedValues);
            variablesEvents.addEventListener(
                'providedValuesChanged',
                this._onProvidedValuesChanged
            );
            super.connectedCallback();
        }

        disconnectedCallback() {
            super.disconnectedCallback();
            variablesEvents.removeEventListener(
                'providedValuesChanged',
                this._onProvidedValuesChanged
            );
        }

        _onProvidedValuesChanged(e) {
            this._setProvidedVariableValues({});
            this._setProvidedVariableValues(e.detail);
        }
    };

export default RESTerVariablesMixin;
