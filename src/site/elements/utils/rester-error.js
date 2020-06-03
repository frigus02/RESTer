import { PolymerElement } from '../../../../node_modules/@polymer/polymer/polymer-element.js';
import { html } from '../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js';
import '../../../../node_modules/@polymer/neon-animation/animations/fade-out-animation.js';
import '../../../../node_modules/@polymer/neon-animation/animations/scale-up-animation.js';
import '../../../../node_modules/@polymer/paper-button/paper-button.js';
import '../../../../node_modules/@polymer/paper-dialog-scrollable/paper-dialog-scrollable.js';
import '../../../../node_modules/@polymer/paper-dialog/paper-dialog.js';
import '../../../../node_modules/web-animations-js/web-animations-next-lite.min.js';
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

                details {
                    margin: 14px 0;
                }
            </style>

            <paper-dialog
                id="dialog"
                entry-animation="scale-up-animation"
                exit-animation="fade-out-animation"
                with-backdrop
                restore-focus-on-close
            >
                <h2>[[title]]</h2>
                <paper-dialog-scrollable>
                    <template is="dom-repeat" items="[[errorMessageLines]]">
                        <p>[[item]]</p>
                    </template>
                    <template is="dom-if" if="[[hasErrorDetails]]">
                        <details>
                            <summary>Details</summary>
                            <pre>[[errorDetails]]</pre>
                        </details>
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
            errorMessageLines: {
                type: Array,
                computed: '_computeErrorMessageLines(error)',
            },
            errorDetails: {
                type: String,
                computed: '_computeErrorDetails(error)',
            },
            hasErrorDetails: {
                type: Boolean,
                computed: '_computeHasErrorDetails(errorDetails)',
            },
        };
    }

    static get titles() {
        return ['Ups, something went wrong!', "Oh no, this shouldn't happen."];
    }

    show(error, title) {
        this.title = title || sample(RESTerError.titles);
        this.error = error;
        this.$.dialog.open();
    }

    _computeErrorMessageLines(error) {
        if (typeof error === 'string') {
            return error.split('\n');
        } else if (error.message) {
            return [`${error.name}: ${error.message}`];
        } else {
            return 'Unknown error';
        }
    }

    _computeErrorDetails(error) {
        if (error.stack) {
            return error.stack;
        } else if (typeof error !== 'string') {
            try {
                return JSON.stringify(error, null, 4);
            } catch (e) {}
        }
    }

    _computeHasErrorDetails(errorDetails) {
        return !!errorDetails;
    }
}

customElements.define(RESTerError.is, RESTerError);
