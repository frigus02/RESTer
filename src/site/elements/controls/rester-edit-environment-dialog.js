import { PolymerElement } from '../../../../node_modules/@polymer/polymer/polymer-element.js';
import { html } from '../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js';
import '../../../../node_modules/@polymer/iron-form/iron-form.js';
import '../../../../node_modules/@polymer/neon-animation/animations/fade-out-animation.js';
import '../../../../node_modules/@polymer/neon-animation/animations/scale-up-animation.js';
import '../../../../node_modules/@polymer/paper-button/paper-button.js';
import '../../../../node_modules/@polymer/paper-dialog-scrollable/paper-dialog-scrollable.js';
import '../../../../node_modules/@polymer/paper-dialog/paper-dialog.js';
import '../../../../node_modules/@polymer/paper-icon-button/paper-icon-button.js';
import '../../../../node_modules/@polymer/paper-input/paper-input.js';
import '../../../../node_modules/@polymer/paper-input/paper-textarea.js';
import '../../../../node_modules/web-animations-js/web-animations-next-lite.min.js';
import '../styles/rester-icons.js';
import { RE_PATTERN_VAR } from '../data/scripts/variables.js';
import RESTerDialogControllerMixin from '../utils/rester-dialog-controller-mixin.js';

/**
 * @appliesMixin RESTerDialogControllerMixin
 * @polymer
 * @customElement
 */
class RESTerEditEnvironmentDialog extends RESTerDialogControllerMixin(
    PolymerElement
) {
    static get template() {
        return html`
            <style>
                paper-dialog {
                    width: 1000px;
                    max-width: 90vw;
                }

                .value-line {
                    display: flex;
                    flex-direction: row;
                    align-items: flex-start;
                }

                .value-line paper-input {
                    flex: 1;
                    flex-basis: 0.000000001px;
                    margin-right: 16px;
                }

                .value-line paper-textarea {
                    flex: 2;
                    overflow: hidden;
                }

                .value-line paper-icon-button {
                    margin-top: 19px;
                }

                .delete-button {
                    color: var(--error-color);
                    margin-left: -8px;
                    margin-right: auto;
                }
            </style>

            <paper-dialog
                id="dialog"
                entry-animation="scale-up-animation"
                exit-animation="fade-out-animation"
                with-backdrop
            >
                <paper-dialog-scrollable>
                    <iron-form id="dialogForm">
                        <form>
                            <paper-input
                                label="Environment"
                                value="{{data.name}}"
                                required
                                error-message="This is required!"
                                autofocus
                            ></paper-input>
                            <template is="dom-repeat" items="[[valueItems]]">
                                <div class="value-line">
                                    <paper-input
                                        label="Key"
                                        value="{{item.key}}"
                                        pattern="^[[rePatternVar]]$"
                                        on-value-changed="_ensureEmptyValueItem"
                                        error-message="Can only contain alphanumeric or ._-$ characters"
                                        auto-validate
                                    ></paper-input>
                                    <paper-textarea
                                        label="Value"
                                        value="{{item.value}}"
                                        on-value-changed="_ensureEmptyValueItem"
                                    ></paper-textarea>
                                    <paper-icon-button
                                        icon="remove"
                                        on-tap="_removeValueItem"
                                    ></paper-icon-button>
                                </div>
                            </template>
                        </form>
                    </iron-form>
                </paper-dialog-scrollable>
                <div class="buttons">
                    <paper-button
                        class="delete-button"
                        hidden$="[[!data.id]]"
                        on-tap="_delete"
                    >
                        Delete
                    </paper-button>
                    <paper-button dialog-dismiss> Cancel </paper-button>
                    <paper-button on-tap="_save"> Save </paper-button>
                </div>
            </paper-dialog>
        `;
    }

    static get is() {
        return 'rester-edit-environment-dialog';
    }

    static get properties() {
        return {
            data: {
                type: Object,
                observer: '_onDataChanged',
            },
            valueItems: {
                type: Array,
                readOnly: true,
            },
            rePatternVar: {
                value: RE_PATTERN_VAR,
            },
        };
    }

    static get resterDialogId() {
        return 'editEnvironment';
    }

    _onDataChanged(newData) {
        if (newData === undefined) {
            this._setValueItems([]);
        } else {
            this._setValueItems(
                Object.keys(newData.values).map((key) => ({
                    key,
                    value: newData.values[key],
                }))
            );
            this._ensureEmptyValueItem();
        }
    }

    _ensureEmptyValueItem() {
        if (
            !this.valueItems.some(
                (value) => value.key.trim() === '' && value.value.trim() === ''
            )
        ) {
            this.push('valueItems', { key: '', value: '' });
        }

        this.$.dialog.notifyResize();
    }

    _removeValueItem(e) {
        this.splice('valueItems', e.model.index, 1);
        this._ensureEmptyValueItem();
    }

    _delete() {
        this._closeDialogWithAction('delete');
    }

    _save() {
        if (this.$.dialogForm.validate()) {
            this.data.values = {};
            this.valueItems.forEach((value) => {
                if (value.key.trim() !== '') {
                    this.data.values[value.key.trim()] = value.value;
                }
            });

            this._closeDialogWithAction('save');
        }
    }
}

customElements.define(
    RESTerEditEnvironmentDialog.is,
    RESTerEditEnvironmentDialog
);
