import { PolymerElement } from '../../../../node_modules/@polymer/polymer/polymer-element.js';
import { html } from '../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js';
import '../../../../node_modules/@polymer/neon-animation/animations/fade-out-animation.js';
import '../../../../node_modules/@polymer/neon-animation/animations/scale-up-animation.js';
import '../../../../node_modules/@polymer/paper-button/paper-button.js';
import '../../../../node_modules/@polymer/paper-dialog-scrollable/paper-dialog-scrollable.js';
import '../../../../node_modules/@polymer/paper-dialog/paper-dialog.js';
import '../../../../node_modules/web-animations-js/web-animations-next-lite.min.js';
import { getAll } from '../data/scripts/hotkeys.js';
import RESTerHotkeysMixin from '../data/rester-data-hotkeys-mixin.js';

/**
 * @appliesMixin RESTerHotkeysMixin
 * @polymer
 * @customElement
 */
class RESTerHotkeysCheatSheet extends RESTerHotkeysMixin(PolymerElement) {
    static get template() {
        return html`
            <style>
                .hotkeys {
                    display: table;
                    border-spacing: 8px;
                    border-collapse: separate;
                }

                .hotkey {
                    display: table-row;
                }

                .hotkey__combos {
                    display: table-cell;
                }

                .hotkey__combo {
                    box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.2),
                                0px 1px 1px 0px rgba(0, 0, 0, 0.14),
                                0px 2px 1px -1px rgba(0, 0, 0, 0.12);
                    background-color: #00BCD4;
                    padding: 4px 8px;
                    border-radius: 2px;
                    display: inline-block;
                    margin-right: 4px;
                    text-transform: capitalize;
                }

                .hotkey__combo:last-child {
                    margin-right: 0;
                }

                .hotkey__description {
                    display: table-cell;
                }
            </style>

            <paper-dialog id="dialog"
                    entry-animation="scale-up-animation"
                    exit-animation="fade-out-animation"
                    with-backdrop
                    restore-focus-on-close>
                <h2>Shortcuts</h2>
                <paper-dialog-scrollable>
                    <div class="hotkeys">
                        <template is="dom-repeat" items="[[hotkeys]]" as="hotkey">
                            <div class="hotkey">
                                <span class="hotkey__combos">
                                    <template is="dom-repeat" items="[[hotkey.combosFormatted]]" as="combo">
                                        <span class="hotkey__combo">[[combo]]</span>
                                    </template>
                                </span>
                                <span class="hotkey__description">[[hotkey.description]]</span>
                            </div>
                        </template>
                    </div>
                </paper-dialog-scrollable>
                <div class="buttons">
                    <paper-button dialog-dismiss autofocus>Close</paper-button>
                </div>
            </paper-dialog>
        `;
    }

    static get is() {
        return 'rester-hotkeys-cheat-sheet';
    }

    static get properties() {
        return {
            hotkeys: {
                type: Array,
                readOnly: true
            }
        };
    }

    static get resterHotkeys() {
        return {
            '?': {
                description: 'Shows this cheat sheet.',
                callback: 'show'
            }
        };
    }

    show() {
        this._setHotkeys([...getAll()]);
        this.$.dialog.open();
    }
}

customElements.define(RESTerHotkeysCheatSheet.is, RESTerHotkeysCheatSheet);
