import { PolymerElement } from '../../../../node_modules/@polymer/polymer/polymer-element.js';
import { html } from '../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js';
import '../../../../node_modules/@polymer/neon-animation/animations/fade-out-animation.js';
import '../../../../node_modules/@polymer/neon-animation/animations/scale-up-animation.js';
import '../../../../node_modules/@polymer/paper-button/paper-button.js';
import '../../../../node_modules/@polymer/paper-dialog-scrollable/paper-dialog-scrollable.js';
import '../../../../node_modules/@polymer/paper-dialog/paper-dialog.js';
import '../../../../node_modules/web-animations-js/web-animations-next-lite.min.js';
import '../controls/rester-code-output.js';
import RESTerThemeMixin from '../data/rester-data-theme-mixin.js';
import { generateCommand } from '../data/scripts/curl.js';
import RESTerDialogControllerMixin from './rester-dialog-controller-mixin.js';

/**
 * @appliesMixin RESTerDialogControllerMixin
 * @polymer
 * @customElement
 */
class RESTerCurlCommandDialog extends RESTerDialogControllerMixin(
    RESTerThemeMixin(PolymerElement)
) {
    static get template() {
        return html`
            <style>
                paper-dialog {
                    max-width: 600px;
                }

                rester-code-output {
                    white-space: pre;
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
                    <rester-code-output>[[curlCommand]]</rester-code-output>
                </paper-dialog-scrollable>
                <div class="buttons">
                    <paper-button
                        hidden$="[[copyToClipboardNotSupported]]"
                        on-tap="_copyToClipboard"
                        >Copy to clipboard</paper-button
                    >
                    <paper-button dialog-dismiss>Close</paper-button>
                </div>
            </paper-dialog>
        `;
    }

    static get is() {
        return 'rester-curl-command-dialog';
    }

    static get resterDialogId() {
        return 'curlCommand';
    }

    static get properties() {
        return {
            data: Object,
            curlCommand: {
                type: String,
                computed: '_computeCurlCommand(data)'
            },
            copyToClipboardNotSupported: {
                type: Boolean,
                value: !(navigator.clipboard && navigator.clipboard.writeText)
            }
        };
    }

    _computeCurlCommand(request) {
        if (request) {
            return generateCommand(request);
        }
    }

    async _copyToClipboard() {
        await navigator.clipboard.writeText(this.curlCommand);
    }
}

customElements.define(RESTerCurlCommandDialog.is, RESTerCurlCommandDialog);
