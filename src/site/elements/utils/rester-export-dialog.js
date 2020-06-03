import { PolymerElement } from '../../../../node_modules/@polymer/polymer/polymer-element.js';
import { html } from '../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js';
import '../../../../node_modules/@polymer/neon-animation/animations/fade-out-animation.js';
import '../../../../node_modules/@polymer/neon-animation/animations/scale-up-animation.js';
import '../../../../node_modules/@polymer/paper-button/paper-button.js';
import '../../../../node_modules/@polymer/paper-checkbox/paper-checkbox.js';
import '../../../../node_modules/@polymer/paper-dialog-scrollable/paper-dialog-scrollable.js';
import '../../../../node_modules/@polymer/paper-dialog/paper-dialog.js';
import '../../../../node_modules/@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
import '../../../../node_modules/@polymer/paper-item/paper-item.js';
import '../../../../node_modules/@polymer/paper-listbox/paper-listbox.js';
import '../../../../node_modules/web-animations-js/web-animations-next-lite.min.js';
import RESTerDialogControllerMixin from './rester-dialog-controller-mixin.js';
import RESTerErrorMixin from './rester-error-mixin.js';
import { exportData } from '../data/scripts/rester.js';

/**
 * @appliesMixin RESTerDialogControllerMixin
 * @appliesMixin RESTerErrorMixin
 * @polymer
 * @customElement
 */
class RESTerExportDialog extends RESTerDialogControllerMixin(
    RESTerErrorMixin(PolymerElement)
) {
    static get template() {
        return html`
            <style>
                paper-dialog {
                    max-width: 600px;
                }

                paper-checkbox,
                paper-dropdown-menu {
                    display: block;
                }

                paper-checkbox {
                    padding: 16px 0;
                }

                paper-button paper-spinner {
                    width: 20px;
                    height: 20px;
                }
            </style>

            <paper-dialog
                id="dialog"
                entry-animation="scale-up-animation"
                exit-animation="fade-out-animation"
                with-backdrop
                restore-focus-on-close
            >
                <paper-dialog-scrollable>
                    <p>
                        The export can include requests and the history.
                        Authorization configs, tokens or environments are not
                        supported.
                    </p>
                    <paper-dropdown-menu label="Format">
                        <paper-listbox
                            slot="dropdown-content"
                            selected="{{format}}"
                            attr-for-selected="value"
                        >
                            <paper-item value="postman"
                                >Postman Collection Format v2.1.0</paper-item
                            >
                        </paper-listbox>
                    </paper-dropdown-menu>
                    <paper-checkbox checked="{{includeHistory}}">
                        Include history
                    </paper-checkbox>
                </paper-dialog-scrollable>
                <div class="buttons">
                    <paper-button dialog-dismiss>Cancel</paper-button>
                    <paper-button
                        disabled$="[[isPreparingExport]]"
                        on-tap="_export"
                    >
                        <span hidden$="[[isPreparingExport]]">Export</span>
                        <span hidden$="[[!isPreparingExport]]">
                            <paper-spinner active></paper-spinner>
                        </span>
                    </paper-button>
                </div>
            </paper-dialog>
        `;
    }

    static get is() {
        return 'rester-export-dialog';
    }

    static get properties() {
        return {
            format: {
                type: String,
                value: 'postman',
            },
            includeHistory: {
                type: Boolean,
                value: true,
            },
            isPreparingExport: {
                type: Boolean,
                value: false,
                readOnly: true,
            },
        };
    }

    static get resterDialogId() {
        return 'export';
    }

    async _export() {
        this._setIsPreparingExport(true);
        try {
            await exportData({
                format: this.format,
                includeHistory: this.includeHistory,
            });
            this._closeDialogWithAction();
        } catch (e) {
            this.showError(e);
        }

        this._setIsPreparingExport(false);
    }
}

customElements.define(RESTerExportDialog.is, RESTerExportDialog);
