import { PolymerElement } from '../../../../node_modules/@polymer/polymer/polymer-element.js';
import { html } from '../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js';
import '../data/rester-data-navigation.js';
import './rester-navigation-list-item.js';

/**
 * @polymer
 * @customElement
 */
class RESTerNavigationList extends PolymerElement {
    static get template() {
        return html`
            <style>
                :host {
                    display: block;
                }
            </style>

            <rester-data-navigation items="{{items}}"></rester-data-navigation>

            <template is="dom-repeat" items="[[items]]">
                <rester-navigation-list-item
                    item="[[item]]"
                    route="[[route]]"
                ></rester-navigation-list-item>
            </template>
        `;
    }

    static get is() {
        return 'rester-navigation-list';
    }

    static get properties() {
        return {
            route: Object,
            items: Array
        };
    }
}

customElements.define(RESTerNavigationList.is, RESTerNavigationList);
