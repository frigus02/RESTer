import { PolymerElement } from '../../../../node_modules/@polymer/polymer/polymer-element.js';
import { html } from '../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js';
import "../../../../node_modules/@polymer/neon-animation/animations/fade-out-animation.js";
import "../../../../node_modules/@polymer/neon-animation/animations/scale-up-animation.js";
import "../../../../node_modules/@polymer/neon-animation/web-animations.js";
import "../../../../node_modules/@polymer/paper-button/paper-button.js";
import "../../../../node_modules/@polymer/paper-dialog-scrollable/paper-dialog-scrollable.js";
import "../../../../node_modules/@polymer/paper-dialog/paper-dialog.js";
import { sample } from '../../../shared/util.js';

/**
 * @polymer
 * @customElement
 */
class RESTerError extends PolymerElement {
    static get template() {
        return html`
            <style>
                paper-dialog {
                    max-width: 600px;
                }

                paper-dialog-scrollable p:not(:first-child) {
                    text-indent: -16px;
                    padding-left: 16px;
                    word-wrap: break-word;
                    white-space: pre-line;
                }
            </style>

            <paper-dialog id="dialog"
                    entry-animation="scale-up-animation"
                    exit-animation="fade-out-animation"
                    with-backdrop
                    restore-focus-on-close>
                <h2>[[title]]</h2>
                <paper-dialog-scrollable>
                    <template is="dom-repeat" items="[[errorMessageLines]]">
                        <p>[[item]]</p>
                    </template>
                </paper-dialog-scrollable>
                <div class="buttons">
                    <paper-button dialog-dismiss autofocus>OK</paper-button>
                </div>
            </paper-dialog>
        `;
    }

    static get is() {
        return 'rester-error';
    }

    static get properties() {
        return {
            title: String,
            error: Object,
            errorMessage: {
                type: String,
                computed: '_computeErrorMessage(error)'
            },
            errorMessageLines: {
                type: Array,
                computed: '_computeErrorMessageLines(errorMessage)'
            }
        };
    }

    static get titles() {
        return [
            'Ups, something went wrong!',
            'Oh no, this shouldn\'t happen.'
        ];
    }

    show(error, title) {
        this.title = title || sample(RESTerError.titles);
        this.error = error;
        this.$.dialog.open();
    }

    _computeErrorMessage(error) {
        if (typeof error === 'string') {
            return error;
        } else if (error.message) {
            return error.message;
        } else {
            try {
                return JSON.stringify(error);
            } catch (e) {
                return 'Unknown error.';
            }
        }
    }

    _computeErrorMessageLines(errorMessage) {
        if (!errorMessage) {
            return [];
        }

        return errorMessage.split('\n');
    }
}

customElements.define(RESTerError.is, RESTerError);
