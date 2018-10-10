import { PolymerElement } from '../../../../node_modules/@polymer/polymer/polymer-element.js';
import { html } from '../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js';

/**
 * @polymer
 * @customElement
 */
class RESTerDrawerFooterLinks extends PolymerElement {
    static get template() {
        return html`
            <style>
                :host {
                    display: block;
                    font-size: 0.75em;
                    color: var(--secondary-text-color);
                    padding: 8px;
                    text-align: center;
                }

                :host ::slotted(a) {
                    color: var(--secondary-text-color);
                }
            </style>

            <slot></slot>
        `;
    }

    static get is() {
        return 'rester-drawer-footer-links';
    }
}

customElements.define(RESTerDrawerFooterLinks.is, RESTerDrawerFooterLinks);
