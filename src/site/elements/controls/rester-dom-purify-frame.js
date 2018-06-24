import { PolymerElement } from '../../../../node_modules/@polymer/polymer/polymer-element.js';
import { html } from '../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js';
import DOMPurify from '../../../../node_modules/dompurify/dist/purify.es.js';

/**
 * @polymer
 * @customElement
 */
class RESTerDOMPurifyIFrame extends PolymerElement {
    static get template() {
        return html`
            <style>
                :host {
                    display: block;
                }

                iframe {
                    border: none;
                    width: 100%;
                }
            </style>

            <iframe id="frame"
                    srcdoc="<html lang='en'><head><meta charset='utf-8'></head><body></body></html>"
                    on-load="_onFrameLoaded"></iframe>
        `;
    }

    static get is() {
        return 'rester-dom-purify-frame';
    }

    static get properties() {
        return {
            html: {
                type: String,
                observer: '_onHtmlChanged'
            }
        };
    }

    constructor() {
        super();
        this._frameLoaded = false;
    }

    _onFrameLoaded() {
        this._frameLoaded = true;
    }

    _onHtmlChanged() {
        if (!this._frameLoaded) {
            setTimeout(() => this._onHtmlChanged(), 100);
            return;
        }

        const doc = this.$.frame.contentWindow.document;
        while (doc.body.children.length > 0) {
            doc.body.children[0].remove();
        }

        const divEl = doc.body.appendChild(doc.createElement('div'));
        divEl.innerHTML = DOMPurify.sanitize(this.html);

        this.$.frame.contentWindow.setTimeout(() => {
            const htmlEl = doc.querySelector('html');
            this.$.frame.style.height = `${htmlEl.offsetHeight}px`;
        });
    }
}

customElements.define(RESTerDOMPurifyIFrame.is, RESTerDOMPurifyIFrame);
