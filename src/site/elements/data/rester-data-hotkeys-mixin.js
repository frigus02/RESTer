import { add, remove, Hotkey } from '../data/scripts/hotkeys.js';

/**
 * @polymer
 * @mixinFunction
 *
 * Registers hotkeys in attached and unregisters them in detached
 * lifecycle callbacks.
 *
 * Define hotkeys in your element by adding a static resterHotkeys
 * getter, which should look like the following:
 *
 * static get resterHotkeys() {
 *     return {
 *         'ctrl+o, ctrl+p': {
 *             description: 'My awesome hotkey',
 *             callback: '_onHotkeyCtrlPPressed'
 *         }
 *     };
 * }
 */
const RESTerHotkeysMixin = (superclass) =>
    class extends superclass {
        constructor() {
            super();
            this._addedResterHotkeys = null;
        }

        connectedCallback() {
            super.connectedCallback();
            this._addedResterHotkeys = this._getResterHotkeys();
            for (let hotkey of this._addedResterHotkeys) {
                add(hotkey);
            }
        }

        disconnectedCallback() {
            super.disconnectedCallback();
            for (let hotkey of this._addedResterHotkeys) {
                remove(hotkey);
            }
        }

        _getResterHotkeys() {
            const hotkeys = this.constructor.resterHotkeys || {};

            return Object.keys(hotkeys).map((comboString) => {
                const details = hotkeys[comboString];

                return new Hotkey({
                    combos: comboString.split(/\s*,\s*/i),
                    description: details.description,
                    callback: this[details.callback].bind(this),
                });
            });
        }
    };

export default RESTerHotkeysMixin;
