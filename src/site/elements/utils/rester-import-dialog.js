import { PolymerElement } from '../../../../node_modules/@polymer/polymer/polymer-element.js';
import { html } from '../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js';
import "../../../../node_modules/@polymer/neon-animation/animations/fade-out-animation.js";
import "../../../../node_modules/@polymer/neon-animation/animations/scale-up-animation.js";
import "../../../../node_modules/@polymer/neon-animation/web-animations.js";
import "../../../../node_modules/@polymer/paper-button/paper-button.js";
import "../../../../node_modules/@polymer/paper-dialog-scrollable/paper-dialog-scrollable.js";
import "../../../../node_modules/@polymer/paper-dialog/paper-dialog.js";
import "../../../../node_modules/@polymer/paper-input/paper-input.js";
import "../controls/rester-file-input.js";
import resterHintStyle from "../styles/rester-hint.js";
import RESTerDialogControllerMixin from './rester-dialog-controller-mixin.js';
import RESTerErrorMixin from './rester-error-mixin.js';
import { importData } from '../data/scripts/rester.js';

/**
 * @appliesMixin RESTerDialogControllerMixin
 * @appliesMixin RESTerErrorMixin
 * @polymer
 * @customElement
 */
class RESTerImportDialog extends RESTerDialogControllerMixin(RESTerErrorMixin(PolymerElement)) {
    static get template() {
        return html`
            ${resterHintStyle}

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

            <paper-dialog id="dialog"
                    entry-animation="scale-up-animation"
                    exit-animation="fade-out-animation"
                    with-backdrop
                    restore-focus-on-close>
                <paper-dialog-scrollable>
                    <p>
                        You can only import requests. History entries, authorization configs,
                        tokens or environments are not supported.
                    </p>
                    <p>
                        Supported formats are the Postman Collection Format v2.0.0 and v2.1.0.
                    </p>
                    <rester-file-input
                            label="Import file"
                            file="{{file}}"></rester-file-input>
                    <paper-input
                            label="Collection Prefix"
                            value="{{collectionPrefix}}"></paper-input>
                    <div class="hint">All requests in the import will be prefixed with this collection. You can use a nested collection (e.g. "My Imports / Version X") or leave it empty to import requestes at the top level.</div>
                </paper-dialog-scrollable>
                <div class="buttons">
                    <paper-button dialog-dismiss>Cancel</paper-button>
                    <paper-button disabled$="[[!_canImport(isImporting, file)]]" on-tap="_import">
                        <span hidden$="[[isImporting]]">Import</span>
                        <span hidden$="[[!isImporting]]">
                            <paper-spinner active></paper-spinner>
                        </span>
                    </paper-button>
                </div>
            </paper-dialog>
        `;
    }

    static get is() {
        return 'rester-import-dialog';
    }

    static get properties() {
        return {
            file: Object,
            collectionPrefix: {
                type: String,
                value: ''
            },
            isImporting: {
                type: Boolean,
                value: false,
                readOnly: true
            }
        };
    }

    static get resterDialogId() {
        return 'import';
    }

    _canImport(isImporting, file) {
        return !isImporting && file;
    }

    async _import() {
        this._setIsImporting(true);
        try {
            await importData({
                data: await this._loadFile(),
                collectionPrefix: this.collectionPrefix
            });
            this._closeDialogWithAction();
        } catch (e) {
            this.showError(e);
        }

        this._setIsImporting(false);
    }

    _loadFile() {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.addEventListener('load', () => resolve(reader.result));
            reader.addEventListener('error', () => reject(reader.error));
            reader.readAsText(this.file);
        });
    }
}

customElements.define(RESTerImportDialog.is, RESTerImportDialog);
