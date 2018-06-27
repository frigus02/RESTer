import { PolymerElement } from '../../../../node_modules/@polymer/polymer/polymer-element.js';
import { html } from '../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js';
import "../../../../node_modules/@polymer/app-layout/app-header-layout/app-header-layout.js";
import "../../../../node_modules/@polymer/app-layout/app-header/app-header.js";
import "../../../../node_modules/@polymer/app-layout/app-toolbar/app-toolbar.js";
import "../../../../node_modules/@polymer/paper-button/paper-button.js";
import "../styles/rester-icons.js";
import "../styles/rester-page-styles.js";
import RESTerPageMixin from '../layout/rester-page-mixin.js';
import dialogs from '../data/scripts/dialogs.js';

/**
 * @appliesMixin RESTerPageMixin
 * @polymer
 * @customElement
 */
class RESTerPageOrganize extends RESTerPageMixin(PolymerElement) {
    static get template() {
        return html`
            <style include="rester-page-styles">
                :host {
                    display: block;
                }

                paper-button {
                    background-color: var(--primary-color);
                    margin: 0 16px 16px 0;
                }
            </style>

            <app-header-layout>
                <app-header slot="header" fixed shadow>
                    <app-toolbar>
                        <paper-icon-button icon="menu" paper-drawer-toggle></paper-icon-button>
                        <div main-title>[[pageTitle]]</div>
                    </app-toolbar>
                </app-header>
                <div role="main">
                    <paper-button raised on-tap="_exportData">
                        Export requests
                    </paper-button>
                    <paper-button raised on-tap="_importData">
                        Import requests
                    </paper-button>
                </div>
            </app-header-layout>
        `;
    }

    static get is() {
        return 'rester-page-organize';
    }

    ready() {
        super.ready();
        this._setPageTitle('Organize');
    }

    _exportData() {
        dialogs.export.show();
    }

    _importData() {
        dialogs.import.show();
    }
}

customElements.define(RESTerPageOrganize.is, RESTerPageOrganize);
