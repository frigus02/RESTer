import dialogs from '../data/scripts/dialogs.js';

/**
 * Provide a `show` method, which accepts data for the dialog and returns
 * a promise. The promise is resolved, when the dialog is closed.
 *
 * The element needs to provide a dialog with the id `dialog` and can provide
 * a form inside with the id `dialogForm`.
 *
 * The element also needs to define static getter called `resterDialogId`.
 * The dialog registers itself with this id on the RESTer dialogs
 * object.
 *
 * @polymer
 * @mixinFunction
 */
const RESTerDialogControllerMixin = (superclass) =>
    class extends superclass {
        static get properties() {
            return {
                data: Object,
            };
        }

        constructor() {
            super();
            this._onDialogClosed = this._onDialogClosed.bind(this);
        }

        connectedCallback() {
            super.connectedCallback();
            this.$.dialog.addEventListener(
                'iron-overlay-closed',
                this._onDialogClosed,
            );
            dialogs[this.constructor.resterDialogId] = this;
        }

        disconnectedCallback() {
            dialogs[this.constructor.resterDialogId] = undefined;
            this.$.dialog.removeEventListener(
                'iron-overlay-closed',
                this._onDialogClosed,
            );
            super.disconnectedCallback();
        }

        show(data) {
            if (this._dialogPromise) {
                return;
            }

            this._dialogPromise = {};
            this.data = undefined;
            if (this.$.dialogForm) {
                this.$.dialogForm.reset();
            }

            return new Promise((resolve) => {
                this._dialogPromise.resolve = resolve;

                setTimeout(() => {
                    this.data = data;

                    this.$.dialog.closingReason = {};
                    this.$.dialog.open();
                });
            });
        }

        _closeDialogWithAction(action) {
            this.$.dialog.closingReason.canceled = false;
            this.$.dialog.closingReason.confirmed = true;
            this.$.dialog.closingReason.action = action;
            this.$.dialog.close();
        }

        _onDialogClosed(e) {
            if (e.target !== this.$.dialog) {
                return;
            }

            const reason = e.detail;
            this._dialogPromise.resolve({ reason, data: this.data });
            this._dialogPromise = undefined;
        }
    };

export default RESTerDialogControllerMixin;
