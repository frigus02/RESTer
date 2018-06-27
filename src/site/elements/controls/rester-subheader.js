import { PolymerElement } from '../../../../node_modules/@polymer/polymer/polymer-element.js';
import { html } from '../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js';

/**
 * @polymer
 * @customElement
 */
class RESTerSubheader extends PolymerElement {
    static get template() {
        return html`
            <style>
                :host {
                    color: var(--secondary-text-color);
                    padding: 0 16px;
                    min-height: 40px;
                    height: 40px;
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    font-family: 'Roboto', 'Noto', sans-serif;
                    -webkit-font-smoothing: antialiased;
                    font-size: 14px;
                    font-weight: 400;
                    line-height: 20px;
                    cursor: default;
                }
            </style>

            <slot></slot>
        `;
    }

    static get is() {
        return 'rester-subheader';
    }
}

customElements.define(RESTerSubheader.is, RESTerSubheader);
