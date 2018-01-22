/**
 * @polymerMixin
 */
const RESTerPageMixin = superclass => class extends superclass {
    static get properties() {
        return {
            pageTitle: {
                type: String,
                readOnly: true,
                notify: true
            },
            showDrawerToggle: {
                type: Boolean,
                observer: '_onShowDrawerToggleChanged'
            }
        };
    }

    constructor() {
        super();
        this._onDrawerTap = this._onDrawerTap.bind(this);
    }

    ready() {
        super.ready();
        this._drawerToggle = this.root.querySelector('[paper-drawer-toggle]');
    }

    connectedCallback() {
        super.connectedCallback();
        if (this._drawerToggle) {
            this._drawerToggle.addEventListener('tap', this._onDrawerTap);
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        if (this._drawerToggle) {
            this._drawerToggle.removeEventListener('tap', this._onDrawerTap);
        }
    }

    _onShowDrawerToggleChanged() {
        if (this._drawerToggle) {
            this._drawerToggle.style.display = this.showDrawerToggle ? 'block' : 'none';
        }
    }

    _onDrawerTap() {
        this.dispatchEvent(new CustomEvent('drawer-toggle-tapped', {
            bubbles: true,
            composed: true
        }));
    }
};

export default RESTerPageMixin;
