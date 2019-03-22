import { PolymerElement } from '../../../../node_modules/@polymer/polymer/polymer-element.js';
import { html } from '../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js';
import './rester-code-output.js';

/**
 * @polymer
 * @customElement
 */
class RESTerHighlightHeaders extends PolymerElement {
    static get template() {
        return html`
            <style>
                :host {
                    display: block;
                    margin-bottom: 16px;
                }
            </style>

            <rester-code-output>
                <template is="dom-repeat" items="[[headers]]">
                    <span class="name">[[item.name]]</span>:
                    <span class="value">[[item.value]]</span>
                    <br />
                </template>
            </rester-code-output>
        `;
    }

    static get is() {
        return 'rester-highlight-headers';
    }

    static get properties() {
        return {
            headers: {
                type: Array,
                value: []
            }
        };
    }
}

customElements.define(RESTerHighlightHeaders.is, RESTerHighlightHeaders);
