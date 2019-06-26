import {
    e as resterEvents,
    settings,
    settingsLoaded
} from '../data/scripts/rester.js';

/**
 * @polymer
 * @mixinFunction
 *
 * Makes RESTer settings available in property `settings`.
 */
const RESTerSettingsMixin = superclass =>
    class extends superclass {
        static get properties() {
            return {
                settings: {
                    type: Object,
                    readOnly: true
                }
            };
        }

        constructor() {
            super();
            this._onSettingsChanged = this._onSettingsChanged.bind(this);
        }

        ready() {
            this._setSettings(settings);
            settingsLoaded.then(() => {
                this._onSettingsChanged({ detail: settings });
            });
            super.ready();
        }

        connectedCallback() {
            super.connectedCallback();
            resterEvents.addEventListener(
                'settingsChange',
                this._onSettingsChanged
            );
        }

        disconnectedCallback() {
            super.disconnectedCallback();
            resterEvents.removeEventListener(
                'settingsChange',
                this._onSettingsChanged
            );
        }

        _onSettingsChanged(e) {
            for (let key in e.detail) {
                if (Object.prototype.hasOwnProperty.call(e.detail, key)) {
                    this.notifyPath(['settings', key]);
                }
            }
        }
    };

export default RESTerSettingsMixin;
