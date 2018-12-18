import { PolymerElement } from '../../../../node_modules/@polymer/polymer/polymer-element.js';
import { html } from '../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js';
import '../../../../node_modules/@polymer/neon-animation/animations/fade-out-animation.js';
import '../../../../node_modules/@polymer/neon-animation/animations/scale-up-animation.js';
import '../../../../node_modules/@polymer/paper-dialog-scrollable/paper-dialog-scrollable.js';
import '../../../../node_modules/@polymer/paper-dialog/paper-dialog.js';
import '../../../../node_modules/@polymer/paper-radio-button/paper-radio-button.js';
import '../../../../node_modules/@polymer/paper-radio-group/paper-radio-group.js';
import '../../../../node_modules/web-animations-js/web-animations-next-lite.min.js';
import { getEnvironments } from '../data/scripts/rester.js';
import RESTerDialogControllerMixin from './rester-dialog-controller-mixin.js';
import RESTerSettingsMixin from '../data/rester-data-settings-mixin.js';

/**
 * @appliesMixin RESTerDialogControllerMixin
 * @appliesMixin RESTerSettingsMixin
 * @polymer
 * @customElement
 */
class RESTerEnvironmentSelectDialog extends RESTerDialogControllerMixin(
    RESTerSettingsMixin(PolymerElement)
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
                        selected="{{settings.activeEnvironment}}"
                        on-paper-radio-group-changed="_close"
                    >
                        <template
                            is="dom-repeat"
                            items="[[environments]]"
                            as="env"
                            sort="_compareEnvironments"
                        >
                            <paper-radio-button name="[[env.id]]">
                                <div>[[env.name]]</div>
                            </paper-radio-button>
                        </template>
                    </paper-radio-group>
                </paper-dialog-scrollable>
            </paper-dialog>
        `;
    }

    static get is() {
        return 'rester-environment-select-dialog';
    }

    static get properties() {
        return {
            environments: {
                type: Array,
                readOnly: true
            }
        };
    }

    static get resterDialogId() {
        return 'environmentSelect';
    }

    async show() {
        const envs = await getEnvironments();
        this._setEnvironments(envs);
        return super.show();
    }

    _compareEnvironments(a, b) {
        return a.name.localeCompare(b.name);
    }

    _close() {
        this._closeDialogWithAction();
    }
}

customElements.define(
    RESTerEnvironmentSelectDialog.is,
    RESTerEnvironmentSelectDialog
);
