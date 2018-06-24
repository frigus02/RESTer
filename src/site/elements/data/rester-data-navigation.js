import { PolymerElement } from '../../../../node_modules/@polymer/polymer/polymer-element.js';
import { getSingle } from './scripts/navigation.js';

/**
 * @polymer
 * @customElement
 */
class RESTerDataNavigation extends PolymerElement {
    static get is() {
        return 'rester-data-navigation';
    }

    static get properties() {
        return {
            items: {
                type: Array,
                value: [],
                readOnly: true,
                notify: true
            }
        };
    }

    constructor() {
        super();
        this._nav = getSingle();
        this._invalidateItems = this._invalidateItems.bind(this);
        this._updateItems = this._updateItems.bind(this);
    }

    connectedCallback() {
        super.connectedCallback();
        if (this._nav.itemsCreated) {
            this._invalidateItems();
        } else {
            this._nav.addEventListener('itemsCreated', this._invalidateItems);
        }

        this._nav.addEventListener('itemsChanged', this._updateItems);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this._nav.removeEventListener('itemsCreated', this._invalidateItems);
        this._nav.removeEventListener('itemsChanged', this._updateItems);
    }

    _invalidateItems() {
        this._setItems([]);
        this._setItems(this._nav.items);
    }

    _updateItems(e) {
        this.notifySplices(
            ['items', ...e.detail.path],
            e.detail.start,
            e.detail.deleteCount,
            ...e.detail.items
        );
    }
}

customElements.define(RESTerDataNavigation.is, RESTerDataNavigation);
