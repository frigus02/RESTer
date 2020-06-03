import { PolymerElement } from '../../../../node_modules/@polymer/polymer/polymer-element.js';
import { html } from '../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js';
import '../../../../node_modules/@polymer/neon-animation/animations/fade-out-animation.js';
import '../../../../node_modules/@polymer/neon-animation/animations/scale-up-animation.js';
import '../../../../node_modules/@polymer/paper-dialog-scrollable/paper-dialog-scrollable.js';
import '../../../../node_modules/@polymer/paper-dialog/paper-dialog.js';
import '../../../../node_modules/@polymer/paper-radio-button/paper-radio-button.js';
import '../../../../node_modules/@polymer/paper-radio-group/paper-radio-group.js';
import '../../../../node_modules/web-animations-js/web-animations-next-lite.min.js';
import RESTerDialogControllerMixin from './rester-dialog-controller-mixin.js';

/**
 * @appliesMixin RESTerDialogControllerMixin
 * @polymer
 * @customElement
 */
class RESTerHighlightLanguageSelectDialog extends RESTerDialogControllerMixin(
    PolymerElement
) {
    static get template() {
        return html`
            <style>
                dom-repeat {
                    display: none;
                }

                paper-radio-group {
                    /*
                    * The ripple from the paper-radio-button is slightly higher than
                    * the full button. After clicking it once, the dialog will get
                    * a scrollbar. This padding makes enough room, so no scollbar
                    * is needed.
                    */
                    padding: 4px 0;
                }

                paper-radio-button {
                    display: block;
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
                    <paper-radio-group
                        selected="{{data}}"
                        on-paper-radio-group-changed="_close"
                    >
                        <template
                            is="dom-repeat"
                            items="[[supportedLanguages]]"
                        >
                            <paper-radio-button name="[[item]]">
                                <div>[[item]]</div>
                            </paper-radio-button>
                        </template>
                    </paper-radio-group>
                </paper-dialog-scrollable>
            </paper-dialog>
        `;
    }

    static get is() {
        return 'rester-highlight-language-select-dialog';
    }

    static get properties() {
        return {
            data: String,
            supportedLanguages: {
                type: Array,
                readOnly: true,
                value: ['Plain', 'HTML', 'JSON', 'XML'],
            },
        };
    }

    static get resterDialogId() {
        return 'highlightLanguageSelect';
    }

    _close() {
        this._closeDialogWithAction();
    }
}

customElements.define(
    RESTerHighlightLanguageSelectDialog.is,
    RESTerHighlightLanguageSelectDialog
);
