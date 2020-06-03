import { PolymerElement } from '../../../../node_modules/@polymer/polymer/polymer-element.js';
import { html } from '../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js';
import '../../../../node_modules/@polymer/neon-animation/animations/fade-out-animation.js';
import '../../../../node_modules/@polymer/neon-animation/animations/scale-up-animation.js';
import '../../../../node_modules/@polymer/paper-button/paper-button.js';
import '../../../../node_modules/@polymer/paper-dialog-scrollable/paper-dialog-scrollable.js';
import '../../../../node_modules/@polymer/paper-dialog/paper-dialog.js';
import '../../../../node_modules/web-animations-js/web-animations-next-lite.min.js';
import { size as formatSize } from '../data/scripts/format.js';
import RESTerDialogControllerMixin from './rester-dialog-controller-mixin.js';

/**
 * @appliesMixin RESTerDialogControllerMixin
 * @polymer
 * @customElement
 */
class RESTerTimingSizeDialog extends RESTerDialogControllerMixin(
    PolymerElement
) {
    static get template() {
        return html`
            <style>
                dom-repeat {
                    display: none;
                }

                .value {
                    text-align: right;
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
                    <table>
                        <tr>
                            <td class="label">Transfered</td>
                            <td class="value">
                                [[_formatSize(data.transferSize)]]
                            </td>
                        </tr>
                        <tr>
                            <td class="label">Body (encoded)</td>
                            <td class="value">
                                [[_formatSize(data.encodedBodySize)]]
                            </td>
                        </tr>
                        <tr>
                            <td class="label">Body (decoded)</td>
                            <td class="value">
                                [[_formatSize(data.decodedBodySize)]]
                            </td>
                        </tr>
                    </table>
                </paper-dialog-scrollable>
                <div class="buttons">
                    <paper-button dialog-dismiss autofocus>OK</paper-button>
                </div>
            </paper-dialog>
        `;
    }

    static get is() {
        return 'rester-timing-size-dialog';
    }

    static get properties() {
        return {
            data: String,
        };
    }

    static get resterDialogId() {
        return 'timingSize';
    }

    _formatSize(size) {
        return formatSize(size);
    }
}

customElements.define(RESTerTimingSizeDialog.is, RESTerTimingSizeDialog);
