import { PolymerElement } from '../../../../node_modules/@polymer/polymer/polymer-element.js';
import { html } from '../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js';
import "../../../../node_modules/@polymer/neon-animation/animations/fade-out-animation.js";
import "../../../../node_modules/@polymer/neon-animation/animations/scale-up-animation.js";
import "../../../../node_modules/@polymer/paper-button/paper-button.js";
import "../../../../node_modules/@polymer/paper-checkbox/paper-checkbox.js";
import "../../../../node_modules/@polymer/paper-dialog-scrollable/paper-dialog-scrollable.js";
import "../../../../node_modules/@polymer/paper-dialog/paper-dialog.js";
import "../../../../node_modules/@polymer/paper-slider/paper-slider.js";
import "../../../../node_modules/@polymer/paper-spinner/paper-spinner.js";
import "../../../../node_modules/web-animations-js/web-animations.min.js";
import { getHistoryEntries, deleteHistoryEntries } from '../data/scripts/rester.js';
import RESTerErrorMixin from './rester-error-mixin.js';
import RESTerDialogControllerMixin from './rester-dialog-controller-mixin.js';

/**
 * @appliesMixin RESTerDialogControllerMixin
 * @appliesMixin RESTerErrorMixin
 * @polymer
 * @customElement
 */
class RESTerNotificationSlowPerformanceDialog extends RESTerDialogControllerMixin(RESTerErrorMixin(PolymerElement)) {
    static get template() {
        return html`
            <style>
                paper-dialog {
                    max-width: 600px;
                }

                .counter-action {
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

            <paper-dialog id="dialog"
                    entry-animation="scale-up-animation"
                    exit-animation="fade-out-animation"
                    with-backdrop
                    restore-focus-on-close
                    on-iron-overlay-opened="_onOpened">
                <h2>RESTer is running slow</h2>
                <paper-dialog-scrollable>
                    <p>
                        RESTer is currently running slow. This happens when the history
                        contains large amounts of data (&gt; ~50 MB). You can speed it
                        up by removing some of your old history data.
                    </p>
                    <p>
                        Below you see the recommended amount of entries to delete:
                    </p>

                    <div class="counter-action">
                        <paper-checkbox checked="{{deleteLargeHistoryEntries}}">
                            Delete large entries ([[largeHistoryEntries.length]] entries over 1MB)
                        </paper-checkbox>
                    </div>

                    <div class="counter-action">
                        <span>Delete oldest entries:</span>
                        <paper-slider
                                value="{{historyEntriesCountToDelete}}"
                                max="[[historyEntries.length]]"
                                pin></paper-slider>
                        <span>[[historyEntriesCountToDelete]] entries</span>
                    </div>
                </paper-dialog-scrollable>
                <div class="buttons">
                    <paper-button dialog-dismiss>Cancel</paper-button>
                    <paper-button disabled$="[[isDeletingEntries]]" on-tap="_deleteOldHistory">
                        <span hidden$="[[isDeletingEntries]]">Delete old entries</span>
                        <span hidden$="[[!isDeletingEntries]]">
                            <paper-spinner active></paper-spinner>
                        </span>
                    </paper-button>
                </div>
            </paper-dialog>
        `;
    }

    static get is() {
        return 'rester-notification-slow-performance-dialog';
    }

    static get properties() {
        return {
            largeHistoryEntries: {
                type: Array,
                readOnly: true
            },
            deleteLargeHistoryEntries: Boolean,
            historyEntries: {
                type: Number,
                readOnly: true
            },
            historyEntriesCountToDelete: Number,
            isDeletingEntries: {
                type: Boolean,
                readOnly: true,
                value: false
            }
        };
    }

    static get resterDialogId() {
        return 'notificationSlowPerformance';
    }

    static get SIZE_1MB() {
        return 1 * 1024 * 1024;
    }

    _onOpened() {
        getHistoryEntries(null, ['id', 'size']).then(entries => {
            this._setHistoryEntries(entries);
            this._setLargeHistoryEntries(entries.filter(this._isEntryLarge));
            this.deleteLargeHistoryEntries = true;

            const targetSize = RESTerNotificationSlowPerformanceDialog.SIZE_1MB * 10;
            const size = this._getSizeOfEntries(entries);
            const sizeOfLargeEntries = this._getSizeOfEntries(this.largeHistoryEntries);

            let sizeAfterDeletion = size - sizeOfLargeEntries;
            let deleteCount = 0;
            while (sizeAfterDeletion > targetSize) {
                deleteCount++;

                const entry = entries[entries.length - deleteCount];
                if (!this._isEntryLarge(entry)) {
                    sizeAfterDeletion -= entry.size;
                }
            }

            this.historyEntriesCountToDelete = deleteCount;
        });
    }

    _deleteOldHistory() {
        this._setIsDeletingEntries(true);

        const idsToDelete = [];
        if (this.deleteLargeHistoryEntries) {
            idsToDelete.push(...this.largeHistoryEntries.map(e => e.id));
        }

        const fromIndex = this.historyEntries.length - 1;
        const toIndex = Math.max(0, this.historyEntries.length - this.historyEntriesCountToDelete);
        for (let i = fromIndex; i >= toIndex; i--) {
            const id = this.historyEntries[i].id;
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
        return entry.size > RESTerNotificationSlowPerformanceDialog.SIZE_1MB;
    }
}

customElements.define(RESTerNotificationSlowPerformanceDialog.is, RESTerNotificationSlowPerformanceDialog);
