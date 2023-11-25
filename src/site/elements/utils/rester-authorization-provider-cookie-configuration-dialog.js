import { PolymerElement } from '../../../../node_modules/@polymer/polymer/polymer-element.js';
import { html } from '../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js';
import '../../../../node_modules/@polymer/iron-a11y-keys/iron-a11y-keys.js';
import '../../../../node_modules/@polymer/iron-form/iron-form.js';
import '../../../../node_modules/@polymer/neon-animation/animations/fade-out-animation.js';
import '../../../../node_modules/@polymer/neon-animation/animations/scale-up-animation.js';
import '../../../../node_modules/@polymer/paper-button/paper-button.js';
import '../../../../node_modules/@polymer/paper-checkbox/paper-checkbox.js';
import '../../../../node_modules/@polymer/paper-dialog-scrollable/paper-dialog-scrollable.js';
import '../../../../node_modules/@polymer/paper-dialog/paper-dialog.js';
import '../../../../node_modules/@polymer/paper-input/paper-input.js';
import '../../../../node_modules/web-animations-js/web-animations-next-lite.min.js';
import resterHintStyle from '../styles/rester-hint.js';
import RESTerDialogControllerMixin from './rester-dialog-controller-mixin.js';

/**
 * @appliesMixin RESTerDialogControllerMixin
 * @polymer
 * @customElement
 */
class RESTerAuthorizationProviderCookieConfigurationDialog extends RESTerDialogControllerMixin(
    PolymerElement,
) {
    static get template() {
        return html`
            ${resterHintStyle}

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

                paper-checkbox {
                    display: block;
                    padding: 16px 8px;
                }

                .delete-button {
                    color: var(--error-color);
                    margin-left: -8px;
                    margin-right: auto;
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
                                label="Title"
                                value="{{data.title}}"
                                required
                                error-message="This is required!"
                                autofocus
                            ></paper-input>
                            <div class="hint">
                                A name for this configuration, only used to
                                identify the config in RESTer.
                            </div>
                            <paper-checkbox checked="{{data.enableVariables}}">
                                Enable environment variables
                            </paper-checkbox>
                            <paper-input
                                label="Start URL"
                                value="{{data.startUrl}}"
                                required
                                error-message="This is required!"
                            ></paper-input>
                            <div class="hint">
                                On token generation, RESTer will open a new
                                browser window and navigate to this URL. Ideally
                                the URL should prompt you to login and then
                                redirect you to the End URL.
                            </div>
                            <paper-input
                                label="End URL"
                                value="{{data.endUrl}}"
                                required
                                error-message="This is required!"
                            ></paper-input>
                            <div class="hint">
                                As soon as the browser navigates to this URL,
                                RESTer will consider the authentication flow
                                successful and close the window.
                            </div>
                            <paper-input
                                label="Cookie Names"
                                value="{{data.cookieNames}}"
                            ></paper-input>
                            <div class="hint">
                                By default RESTer will extract all cookies in
                                the domain of the Start URL. You can optionally
                                provide a semicolon (;) separated list of cookie
                                names here to filter the extracted cookies.
                            </div>
                        </form>
                    </iron-form>
                </paper-dialog-scrollable>
                <div class="buttons">
                    <paper-button
                        class="delete-button"
                        hidden$="[[!data.id]]"
                        on-tap="_delete"
                    >
                        Delete
                    </paper-button>
                    <paper-button dialog-dismiss> Cancel </paper-button>
                    <paper-button on-tap="_save"> Save </paper-button>
                </div>
            </paper-dialog>
        `;
    }

    static get is() {
        return 'rester-authorization-provider-cookie-configuration-dialog';
    }

    static get properties() {
        return {
            data: Object,
            form: Object,
        };
    }

    static get resterDialogId() {
        return 'authProviderCookieConfiguration';
    }

    ready() {
        super.ready();
        this.form = this.$.dialogForm;
    }

    _save() {
        if (this.$.dialogForm.validate()) {
            this._closeDialogWithAction('save');
        }
    }

    _delete() {
        this._closeDialogWithAction('delete');
    }
}

customElements.define(
    RESTerAuthorizationProviderCookieConfigurationDialog.is,
    RESTerAuthorizationProviderCookieConfigurationDialog,
);
