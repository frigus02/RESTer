import { PolymerElement } from '../../../../node_modules/@polymer/polymer/polymer-element.js';
import { html } from '../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js';
import RESTerThemeMixin from '../data/rester-data-theme-mixin.js';

/**
 * @appliesMixin RESTerThemeMixin
 * @polymer
 * @customElement
 */
class RESTerCodeOutput extends RESTerThemeMixin(PolymerElement) {
    static get template() {
        const template = html`
            <style>
                :host {
                    display: block;
                    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas',
                        'source-code-pro', monospace;
                    font-size: 12px;
                    font-weight: 400;
                    line-height: 16px;
                    padding: 4px;
                    overflow-wrap: break-word;
                }

                :host([theme='dark']) {
                    background-color: #141414;
                    color: #f8f8f8;
                }

                :host([theme='dark']) ::slotted(.name) {
                    color: #7587a6;
                }

                :host([theme='dark']) ::slotted(.value) {
                    color: #8f9d6a;
                }

                :host([theme='light']) {
                    background-color: #f5f5f5;
                    color: #000;
                }

                :host([theme='light']) ::slotted(.name) {
                    color: #318495;
                }

                :host([theme='light']) ::slotted(.value) {
                    color: #1a1aa6;
                }
            </style>

            <slot></slot>
        `;
        template.setAttribute('strip-whitespace', '');
        return template;
    }

    static get is() {
        return 'rester-code-output';
    }
}

customElements.define(RESTerCodeOutput.is, RESTerCodeOutput);
