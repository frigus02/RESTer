import { PolymerElement } from '../../../../node_modules/@polymer/polymer/polymer-element.js';
import { html } from '../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js';
import '../../../../node_modules/@polymer/paper-badge/paper-badge.js';
import '../../../../node_modules/@polymer/paper-icon-button/paper-icon-button.js';
import '../../../../node_modules/@polymer/paper-item/paper-item-body.js';
import '../../../../node_modules/@polymer/paper-item/paper-item.js';
import '../../../../node_modules/@polymer/paper-listbox/paper-listbox.js';
import '../../../../node_modules/@polymer/paper-menu-button/paper-menu-button.js';
import '../styles/rester-icons.js';
import {
    e as notificationEvents,
    notifications,
} from '../data/scripts/notifications.js';

/**
 * @polymer
 * @customElement
 */
class RESTerNotifications extends PolymerElement {
    static get template() {
        return html`
            <style>
                :host {
                    display: inline-block;
                }

                paper-menu-button {
                    --paper-menu-button: {
                        padding: 0;
                    };
                }

                paper-badge {
                    --paper-badge: {
                        margin-top: 4px;
                        margin-left: -8px;
                    };
                }

                paper-item {
                    white-space: nowrap;
                }
            </style>

            <paper-menu-button
                id="options"
                dynamic-align
                vertical-offset="48"
                restore-focus-on-close
            >
                <paper-icon-button
                    slot="dropdown-trigger"
                    id="menu-button"
                    icon="[[icon]]"
                ></paper-icon-button>
                <paper-listbox
                    slot="dropdown-content"
                    selectable="[role='menuitemradio']"
                >
                    <template is="dom-repeat" items="[[notifications]]">
                        <paper-item role="menuitem" on-tap="_openNotification">
                            <paper-item-body two-line>
                                <div>[[item.title]]</div>
                                <div secondary>[[item.description]]</div>
                            </paper-item-body>
                        </paper-item>
                    </template>
                    <template is="dom-if" if="[[isEmpty]]">
                        <paper-item role="menuitem" disabled>
                            No notifications
                        </paper-item>
                    </template>
                </paper-listbox>
            </paper-menu-button>

            <paper-badge
                for="menu-button"
                label="[[notifications.length]]"
                hidden$="[[isEmpty]]"
            ></paper-badge>
        `;
    }

    static get is() {
        return 'rester-notifications';
    }

    static get properties() {
        return {
            notifications: {
                type: Array,
                readOnly: true,
            },
            isEmpty: {
                type: Boolean,
                computed: '_computeIsEmpty(notifications.length)',
            },
            icon: {
                type: String,
                computed: '_computeIcon(isEmpty)',
            },
        };
    }

    constructor() {
        super();
        this._onNotificationAdded = this._onNotificationAdded.bind(this);
        this._onNotificationRemoved = this._onNotificationRemoved.bind(this);
    }

    connectedCallback() {
        super.connectedCallback();
        this._setNotifications([...notifications]);
        notificationEvents.addEventListener(
            'notificationAdded',
            this._onNotificationAdded,
        );
        notificationEvents.addEventListener(
            'notificationRemoved',
            this._onNotificationRemoved,
        );
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        notificationEvents.removeEventListener(
            'notificationAdded',
            this._onNotificationAdded,
        );
        notificationEvents.removeEventListener(
            'notificationRemoved',
            this._onNotificationRemoved,
        );
    }

    _onNotificationAdded(e) {
        this.push('notifications', e.detail);
    }

    _onNotificationRemoved(e) {
        const index = this.notifications.indexOf(e.detail);
        this.splice('notifications', index, 1);
    }

    _computeIsEmpty(notificationsCount) {
        return notificationsCount === 0;
    }

    _computeIcon(isEmpty) {
        return isEmpty ? 'notifications-none' : 'notifications';
    }

    _openNotification(e) {
        this.$.options.close();

        const notification = e.model.item;
        notification.open();
    }
}

customElements.define(RESTerNotifications.is, RESTerNotifications);
