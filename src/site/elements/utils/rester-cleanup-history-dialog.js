import { PolymerElement } from '../../../../node_modules/@polymer/polymer/polymer-element.js';
import { html } from '../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js';
import '../../../../node_modules/@polymer/neon-animation/animations/fade-out-animation.js';
import '../../../../node_modules/@polymer/neon-animation/animations/scale-up-animation.js';
import '../../../../node_modules/@polymer/paper-button/paper-button.js';
import '../../../../node_modules/@polymer/paper-checkbox/paper-checkbox.js';
import '../../../../node_modules/@polymer/paper-dialog-scrollable/paper-dialog-scrollable.js';
import '../../../../node_modules/@polymer/paper-dialog/paper-dialog.js';
import '../../../../node_modules/@polymer/paper-slider/paper-slider.js';
import '../../../../node_modules/@polymer/paper-spinner/paper-spinner.js';
import '../../../../node_modules/web-animations-js/web-animations-next-lite.min.js';
import {
    getHistoryEntries,
    deleteHistoryEntries
} from '../data/scripts/rester.js';
import RESTerErrorMixin from './rester-error-mixin.js';
import RESTerDialogControllerMixin from './rester-dialog-controller-mixin.js';

/**
 * @appliesMixin RESTerDialogControllerMixin
 * @appliesMixin RESTerErrorMixin
 * @polymer
 * @customElement
 */
class RESTerHistoryCleanupDialog extends RESTerDialogControllerMixin(
    RESTerErrorMixin(PolymerElement)
) {
    static get template() {
        return html`
            <style>
                paper-dialog {
                    max-width: 600px;
                }

                .action {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    margin: 16px 16px 0;
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
                on-iron-overlay-opened="_onOpened"
            >
                <h2>Clean up history</h2>
                <paper-dialog-scrollable>
                    <p>
                        Deleting old history entries can make RESTer faster and
                        free up some disk space.
                    </p>

                    <template is="dom-if" if="[[largeEntries.length]]">
                        <div class="action">
                            <paper-checkbox checked="{{deleteLargeEntries}}">
                                Delete large entries ([[largeEntries.length]]
                                entries over 1MB)
                            </paper-checkbox>
                        </div>
                    </template>

                    <template is="dom-if" if="[[entries.length]]">
                        <div class="action">
                            <span>Delete oldest entries:</span>
                            <paper-slider
                                value="{{entryCountToDelete}}"
                                max="[[entries.length]]"
                                pin
                            ></paper-slider>
                            <span>[[entryCountToDelete]] entries</span>
                        </div>
                    </template>

                    <template is="dom-if" if="[[!entries.length]]">
                        <p>The history is empty. Nothing to clean up.</p>
                    </template>
                </paper-dialog-scrollable>
                <div class="buttons">
                    <paper-button dialog-dismiss>Cancel</paper-button>
                    <paper-button
                        disabled$="[[!canDeleteEntries]]"
                        on-tap="_deleteOldHistory"
                    >
                        <span hidden$="[[isDeletingEntries]]"
                            >Delete entries</span
                        >
                        <span hidden$="[[!isDeletingEntries]]">
                            <paper-spinner active></paper-spinner>
                        </span>
                    </paper-button>
                </div>
            </paper-dialog>
        `;
    }

    static get is() {
        return 'rester-cleanup-history-dialog';
    }

    static get properties() {
        return {
            largeEntries: {
                type: Array,
                readOnly: true
            },
            deleteLargeEntries: Boolean,
            entries: {
                type: Array,
                readOnly: true
            },
            entryCountToDelete: Number,
            canDeleteEntries: {
                type: Boolean,
                computed:
                    '_computeCanDeleteEntries(deleteLargeEntries, entryCountToDelete, isDeletingEntries)'
            },
            isDeletingEntries: {
                type: Boolean,
                readOnly: true,
                value: false
            }
        };
    }

    static get resterDialogId() {
        return 'historyCleanup';
    }

    static get SIZE_1MB() {
        return 1 * 1024 * 1024;
    }

    _onOpened() {
        getHistoryEntries(null, ['id', 'size']).then(entries => {
            this._setEntries(entries);
            this._setLargeEntries(entries.filter(this._isEntryLarge));
            this.deleteLargeEntries = this.largeEntries.length > 0;

            const targetSize = RESTerHistoryCleanupDialog.SIZE_1MB * 10;
            const size = this._getSizeOfEntries(entries);
            const sizeOfLargeEntries = this._getSizeOfEntries(
                this.largeEntries
            );

            let sizeAfterDeletion = size - sizeOfLargeEntries;
            let deleteCount = 0;
            while (sizeAfterDeletion > targetSize) {
                deleteCount++;

                const entry = entries[entries.length - deleteCount];
                if (!this._isEntryLarge(entry)) {
                    sizeAfterDeletion -= entry.size;
                }
            }

            this.entryCountToDelete = deleteCount;
        });
    }

    _deleteOldHistory() {
        this._setIsDeletingEntries(true);

        const idsToDelete = [];
        if (this.deleteLargeEntries) {
            idsToDelete.push(...this.largeEntries.map(e => e.id));
        }

        const fromIndex = this.entries.length - 1;
        const toIndex = Math.max(
            0,
            this.entries.length - this.entryCountToDelete
        );
        for (let i = fromIndex; i >= toIndex; i--) {
            const id = this.entries[i].id;
            if (!idsToDelete.includes(id)) {
                idsToDelete.push(id);
            }
        }

        deleteHistoryEntries(idsToDelete)
            .then(() => {
                this._setIsDeletingEntries(false);
                this._closeDialogWithAction();
            })
            .catch(error => {
                this._setIsDeletingEntries(false);
                this.showError(error);
            });
    }

    _getSizeOfEntries(entries) {
        return entries.map(e => e.size).reduce((a, b) => a + b, 0);
    }

    _isEntryLarge(entry) {
        return entry.size > RESTerHistoryCleanupDialog.SIZE_1MB;
    }

    _computeCanDeleteEntries(
        deleteLargeEntries,
        entryCountToDelete,
        isDeletingEntries
    ) {
        return (
            (deleteLargeEntries || entryCountToDelete > 0) && !isDeletingEntries
        );
    }
}

customElements.define(
    RESTerHistoryCleanupDialog.is,
    RESTerHistoryCleanupDialog
);
