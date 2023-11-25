import { PolymerElement } from '../../../../node_modules/@polymer/polymer/polymer-element.js';
import { html } from '../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js';
import '../pages/rester-page-about.js';
import '../pages/rester-page-environments.js';
import '../pages/rester-page-history.js';
import '../pages/rester-page-organize.js';
import '../pages/rester-page-request.js';
import '../pages/rester-page-settings.js';

/**
 * @polymer
 * @customElement
 */
class RESTerPages extends PolymerElement {
    static get template() {
        return html`
            <style>
                :host {
                    display: block;
                    position: relative;
                }

                :host ::slotted(.old-page) {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 1;
                    background-color: var(--primary-background-color);

                    opacity: 1;
                    transition: opacity 0.3s ease;
                    will-change: opacity;
                }

                :host ::slotted(.old-page.animate-out) {
                    opacity: 0;
                }
            </style>

            <slot></slot>
        `;
    }

    static get is() {
        return 'rester-pages';
    }

    static get properties() {
        return {
            page: {
                type: String,
                observer: '_onPageChanged',
            },
            pageTitle: {
                type: String,
                readOnly: true,
                notify: true,
            },
            route: {
                type: Object,
                observer: '_onRouteChanged',
            },
            showDrawerToggle: {
                type: Boolean,
                observer: '_onShowDrawerToggleChanged',
            },
        };
    }

    constructor() {
        super();
        this._currentElement = null;
    }

    _onPageChanged() {
        if (this._currentElement) {
            const oldElement = this._currentElement;
            this._currentElement = null;
            this._setPageTitle(undefined);

            oldElement.classList.remove('page');
            oldElement.classList.add('old-page');
            requestAnimationFrame(() => {
                oldElement.classList.add('animate-out');
                oldElement.addEventListener('transitionend', () => {
                    this.removeChild(oldElement);
                });
            });
        }

        if (this.page) {
            this._currentElement = document.createElement(
                `rester-page-${this.page}`,
            );
            this._currentElement.classList.add('page');

            this.appendChild(this._currentElement);

            this._setPageTitle(this._currentElement.pageTitle);
            this._currentElement.addEventListener('page-title-changed', () => {
                this._setPageTitle(this._currentElement.pageTitle);
            });

            this._currentElement.route = this.route;
            this._currentElement.showDrawerToggle = this.showDrawerToggle;
        }
    }

    _onRouteChanged() {
        if (this._currentElement) {
            this._currentElement.route = this.route;
        }
    }

    _onShowDrawerToggleChanged() {
        if (this._currentElement) {
            this._currentElement.showDrawerToggle = this.showDrawerToggle;
        }
    }
}

customElements.define(RESTerPages.is, RESTerPages);
