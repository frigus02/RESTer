import { PolymerElement } from '../../../../node_modules/@polymer/polymer/polymer-element.js';
import { html } from '../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js';
import '../../../../node_modules/@polymer/iron-a11y-keys/iron-a11y-keys.js';
import '../../../../node_modules/@polymer/iron-form/iron-form.js';
import '../../../../node_modules/@polymer/neon-animation/animations/fade-out-animation.js';
import '../../../../node_modules/@polymer/neon-animation/animations/scale-up-animation.js';
import '../../../../node_modules/@polymer/paper-button/paper-button.js';
import '../../../../node_modules/@polymer/paper-dialog-scrollable/paper-dialog-scrollable.js';
import '../../../../node_modules/@polymer/paper-dialog/paper-dialog.js';
import '../../../../node_modules/@polymer/paper-input/paper-input.js';
import '../../../../node_modules/web-animations-js/web-animations-next-lite.min.js';
import RESTerDialogControllerMixin from './rester-dialog-controller-mixin.js';

/**
 * @appliesMixin RESTerDialogControllerMixin
 * @polymer
 * @customElement
 */
class RESTerAuthorizationProviderOAuth2GenerateTokenResourceOwnerDialog extends RESTerDialogControllerMixin(
    PolymerElement,
) {
    static get template() {
        return html`
            <style>
                paper-dialog {
                    max-width: 600px;
                }

                form {
                    /*
                    * The paper-input-error inside of the paper-input is positioned
                    * absolute underneath the input and has 20px height. Without the
                    * padding the dialog would start scrolling.
                    */
                    padding-bottom: 20px;
                }
            </style>

            <paper-dialog
                id="dialog"
                entry-animation="scale-up-animation"
                exit-animation="fade-out-animation"
                with-backdrop
            >
                <paper-dialog-scrollable>
                    <iron-a11y-keys
                        target="[[form]]"
                        keys="enter"
                        on-keys-pressed="_save"
                        stop-keyboard-event-propagation
                    ></iron-a11y-keys>
                    <iron-form id="dialogForm">
                        <form>
                            <paper-input
                                label="User name"
                                value="{{data.username}}"
                                required
                                error-message="This is required!"
                                autofocus
                            ></paper-input>
                            <paper-input
                                label="Password"
                                value="{{data.password}}"
                                type="password"
                                required
                                error-message="This is required!"
                            ></paper-input>
                        </form>
                    </iron-form>
                </paper-dialog-scrollable>
                <div class="buttons">
                    <paper-button dialog-dismiss> Cancel </paper-button>
                    <paper-button on-tap="_save"> Save </paper-button>
                </div>
            </paper-dialog>
        `;
    }

    static get is() {
        return 'rester-authorization-provider-oauth2-generate-token-resource-owner-dialog';
    }

    static get properties() {
        return {
            data: Object,
            form: Object,
        };
    }

    static get resterDialogId() {
        return 'authProviderOAuth2GenerateTokenResourceOwner';
    }

    ready() {
        super.ready();
        this.form = this.$.dialogForm;
    }

    _save() {
        if (this.$.dialogForm.validate()) {
            this._closeDialogWithAction();
        }
    }
}

customElements.define(
    RESTerAuthorizationProviderOAuth2GenerateTokenResourceOwnerDialog.is,
    RESTerAuthorizationProviderOAuth2GenerateTokenResourceOwnerDialog,
);
