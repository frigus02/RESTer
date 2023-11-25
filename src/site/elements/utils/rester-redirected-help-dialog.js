import { PolymerElement } from '../../../../node_modules/@polymer/polymer/polymer-element.js';
import { html } from '../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js';
import '../../../../node_modules/@polymer/neon-animation/animations/fade-out-animation.js';
import '../../../../node_modules/@polymer/neon-animation/animations/scale-up-animation.js';
import '../../../../node_modules/@polymer/paper-button/paper-button.js';
import '../../../../node_modules/@polymer/paper-dialog-scrollable/paper-dialog-scrollable.js';
import '../../../../node_modules/@polymer/paper-dialog/paper-dialog.js';
import '../../../../node_modules/web-animations-js/web-animations-next-lite.min.js';
import RESTerDialogControllerMixin from './rester-dialog-controller-mixin.js';

/**
 * @appliesMixin RESTerDialogControllerMixin
 * @polymer
 * @customElement
 */
class RESTerRedirectedHelpDialog extends RESTerDialogControllerMixin(
    PolymerElement,
) {
    static get template() {
        return html`
            <style>
                paper-dialog {
                    max-width: 600px;
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
                    <p>
                        The server returned a redirect response (status 3xx) to
                        the initial request. Your browser followed the redirect
                        and automatically sent a request to the next address.
                        The response shown below is the response to the last
                        request.
                    </p>
                    <p>
                        If you want RESTer to stop the browser from following
                        redirects, go to settings and change the request mode to
                        "Clean Requests".
                    </p>
                </paper-dialog-scrollable>
                <div class="buttons">
                    <paper-button dialog-dismiss autofocus>OK</paper-button>
                </div>
            </paper-dialog>
        `;
    }

    static get is() {
        return 'rester-redirected-help-dialog';
    }

    static get resterDialogId() {
        return 'redirectedHelp';
    }
}

customElements.define(
    RESTerRedirectedHelpDialog.is,
    RESTerRedirectedHelpDialog,
);
