import { PolymerElement } from '../../../../node_modules/@polymer/polymer/polymer-element.js';
import { html } from '../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js';

/**
 * @polymer
 * @customElement
 */
class RESTerBadge extends PolymerElement {
    static get template() {
        return html`
            <style>
                :host {
                    display: inline-block;
                    border-radius: 2px;
                    padding: 4px 8px;
                    margin-left: 1em;
                    font-weight: bold;
                }

                :host([type="info"]) {
                    background-color: #00bcd4;
                }

                :host([type="success"]) {
                    background-color: #4caf50;
                }

                :host([type="warn"]) {
                    background-color: #f44336;
                }
            </style>

            <slot></slot>
        `;
    }

    static get is() {
        return 'rester-badge';
    }

    static get properties() {
        return {
            type: {
                type: String,
                reflectToAttribute: true
            }
        };
    }
}

customElements.define(RESTerBadge.is, RESTerBadge);
