import { PolymerElement } from '../../../../node_modules/@polymer/polymer/polymer-element.js';
import { html } from '../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js';
import '../../../../node_modules/@polymer/iron-input/iron-input.js';
import '../../../../node_modules/@polymer/neon-animation/animations/fade-out-animation.js';
import '../../../../node_modules/@polymer/neon-animation/animations/scale-up-animation.js';
import '../../../../node_modules/@polymer/paper-dialog/paper-dialog.js';
import '../../../../node_modules/web-animations-js/web-animations-next-lite.min.js';
import '../controls/rester-autocomplete.js';
import { getRequests } from '../data/scripts/rester.js';

/**
 * @polymer
 * @customElement
 */
class RESTerQuickOpenDialog extends PolymerElement {
    static get template() {
        return html`
            <style>
                paper-dialog {
                    max-width: 400px;
                    width: 100%;
                    margin: 0;
                    border-radius: 4px;
                    top: 12px !important;
                }

                @media only screen and (max-width: 600px) {
                    paper-dialog {
                        top: 8px !important;
                    }
                }

                paper-dialog > :first-child,
                paper-dialog > :last-child,
                paper-dialog > * {
                    margin: 0 !important;
                    padding: 0;
                }

                iron-input {
                    width: 100%;
                }

                input {
                    padding: 8px;
                    width: 100%;
                    max-width: 100%;
                    background: transparent;
                    border: none;
                    box-sizing: border-box;
                    color: var(--primary-text-color);
                    -webkit-appearance: none;

                    font-size: 16px;
                    font-weight: 400;
                    line-height: 24px;
                    font-family: 'Roboto', 'Noto', sans-serif;
                    -webkit-font-smoothing: antialiased;
                }
            </style>

            <paper-dialog
                id="dialog"
                entry-animation="scale-up-animation"
                exit-animation="fade-out-animation"
                with-backdrop
                restore-focus-on-close
            >
                <div>
                    <iron-input bind-value="{{searchText}}">
                        <input
                            id="nativeInput"
                            placeholder="Type to open a request..."
                            autocomplete="off"
                            autofocus
                        />
                    </iron-input>
                    <rester-autocomplete
                        for="nativeInput"
                        items="[[items]]"
                        on-item-selected="_onItemSelected"
                    ></rester-autocomplete>
                </div>
            </paper-dialog>
        `;
    }

    static get is() {
        return 'rester-quick-open-dialog';
    }

    static get properties() {
        return {
            searchText: String,
            items: {
                type: Array,
                readOnly: true,
            },
        };
    }

    static get requestFields() {
        return ['id', 'collection', 'title', 'method', 'url'];
    }

    show() {
        this.searchText = '';
        getRequests(RESTerQuickOpenDialog.requestFields).then((requests) => {
            this._setItems(
                requests.map((r) => ({
                    title: `${r.collection} / ${r.title}`,
                    description: `${r.method} ${r.url}`,
                    score: 0,
                    data: r,
                })),
            );
        });

        this.$.dialog.open();
    }

    _onItemSelected(e) {
        this.$.dialog.close();

        const item = e.detail;
        if (item) {
            window.location = `#/request/${item.data.id}`;
        }
    }
}

customElements.define(RESTerQuickOpenDialog.is, RESTerQuickOpenDialog);
