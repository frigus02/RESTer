import { PolymerElement } from '../../../../node_modules/@polymer/polymer/polymer-element.js';
import { html } from '../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js';
import '../../../../node_modules/@polymer/paper-button/paper-button.js';
import '../../../../node_modules/@polymer/paper-icon-button/paper-icon-button.js';
import '../styles/rester-icons.js';

/**
 * @polymer
 * @customElement
 */
class RESTerLintMessages extends PolymerElement {
    static get template() {
        return html`
            <style>
                :host {
                    display: block;
                }

                .lint-message {
                    background-color: var(--accent-color);
                    color: var(--light-theme-text-color);
                    padding: 0 16px;

                    display: flex;
                    flex-direction: row;
                    align-items: center;
                }

                .text {
                    flex: 1;
                }

                .dismiss-button {
                    margin-right: -8px;
                }
            </style>

            <template
                is="dom-repeat"
                items="[[messages]]"
                filter="_filterDismissedMessage"
                observe="dismissed"
            >
                <div class="lint-message">
                    <div class="text">[[item.message]]</div>
                    <template is="dom-if" if="[[item.fix]]">
                        <paper-button on-tap="_fixMessage"
                            >[[item.fixLabel]]</paper-button
                        >
                    </template>
                    <paper-icon-button
                        icon="close"
                        class="dismiss-button"
                        on-tap="_dismissMessage"
                    ></paper-icon-button>
                </div>
            </template>
        `;
    }

    static get is() {
        return 'rester-lint-messages';
    }

    static get properties() {
        return {
            messages: {
                type: Array,
                readOnly: true,
                value: [],
            },
        };
    }

    putMessage(id, message) {
        const index = this.messages.findIndex((m) => m.id === id);

        message.id = id;
        if (index === -1) {
            this.push('messages', message);
        } else {
            this.splice('messages', index, 1, message);
        }
    }

    removeMessage(id) {
        const index = this.messages.findIndex((m) => m.id === id);
        if (index > -1) {
            this.splice('messages', index, 1);
        }
    }

    _filterDismissedMessage(message) {
        return !message.dismissed;
    }

    _fixMessage(e) {
        e.model.item.fix();
    }

    _dismissMessage(e) {
        this.set(['messages', e.model.index, 'dismissed'], true);
    }
}

customElements.define(RESTerLintMessages.is, RESTerLintMessages);
