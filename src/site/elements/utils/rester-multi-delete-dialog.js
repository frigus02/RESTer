import { PolymerElement } from '../../../../node_modules/@polymer/polymer/polymer-element.js';
import { html } from '../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js';
import '../../../../node_modules/@polymer/neon-animation/animations/fade-out-animation.js';
import '../../../../node_modules/@polymer/neon-animation/animations/scale-up-animation.js';
import '../../../../node_modules/@polymer/paper-button/paper-button.js';
import '../../../../node_modules/@polymer/paper-checkbox/paper-checkbox.js';
import '../../../../node_modules/@polymer/paper-dialog-scrollable/paper-dialog-scrollable.js';
import '../../../../node_modules/@polymer/paper-dialog/paper-dialog.js';
import '../../../../node_modules/@polymer/paper-spinner/paper-spinner.js';
import '../../../../node_modules/web-animations-js/web-animations-next-lite.min.js';
import RESTerDialogControllerMixin from './rester-dialog-controller-mixin.js';
import RESTerErrorMixin from './rester-error-mixin.js';
import { getRequests, deleteRequest } from '../data/scripts/rester.js';

class RESTerMultiDeleteItem extends PolymerElement {
    static get template() {
        return html`
            <style>
                ul {
                    list-style-type: none;
                    padding-left: 2em;
                }

                li {
                    margin: 0.4em 0;
                }
            </style>

            <template is="dom-if" if="[[hasTitle]]">
                <paper-checkbox
                    checked="[[checked]]"
                    on-change="_onCheckedChange"
                    >[[title]]</paper-checkbox
                >
            </template>
            <ul>
                <template is="dom-repeat" items="[[children]]" as="child">
                    <li>
                        <rester-multi-delete-item
                            title="[[child.title]]"
                            checked="{{child.checked}}"
                            children="[[child.children]]"
                        ></rester-multi-delete-item>
                    </li>
                </template>
            </ul>
        `;
    }

    static get is() {
        return 'rester-multi-delete-item';
    }

    static get properties() {
        return {
            title: String,
            checked: {
                type: Boolean,
                notify: true,
                observer: '_cascadeCheckedToChildren',
            },
            hasTitle: {
                type: Boolean,
                computed: '_computeHasTitle(title)',
            },
            children: Array,
        };
    }

    _computeHasTitle(title) {
        return typeof title === 'string' && title.length > 0;
    }

    _onCheckedChange() {
        this.checked = !this.checked;
    }

    _cascadeCheckedToChildren() {
        if (this.checked && this.children) {
            for (let i = 0; i < this.children.length; i++) {
                this.set(['children', i, 'checked'], false);
                this.set(['children', i, 'checked'], true);
            }
        }
    }
}

customElements.define(RESTerMultiDeleteItem.is, RESTerMultiDeleteItem);

class RESTerMultiDeleteDialog extends RESTerDialogControllerMixin(
    RESTerErrorMixin(PolymerElement)
) {
    static get template() {
        return html`
            <style>
                paper-dialog {
                    max-width: 600px;
                }

                paper-button paper-spinner {
                    width: 20px;
                    height: 20px;
                }
            </style>

            <paper-dialog
                id="dialog"
                entry-animation="scale-up-animation"
                exit-animation="fade-out-animation"
                with-backdrop
                restore-focus-on-close
                on-iron-overlay-opened="_onOpened"
            >
                <h2>Clean up requests</h2>
                <paper-dialog-scrollable>
                    <rester-multi-delete-item
                        children="[[requests]]"
                    ></rester-multi-delete-item>
                </paper-dialog-scrollable>
                <div class="buttons">
                    <paper-button dialog-dismiss>Cancel</paper-button>
                    <paper-button
                        disabled$="[[isWorking]]"
                        on-tap="_deleteRequests"
                    >
                        <span hidden$="[[isWorking]]"
                            >Delete selected requests</span
                        >
                        <span hidden$="[[!isWorking]]">
                            <paper-spinner active></paper-spinner>
                        </span>
                    </paper-button>
                </div>
            </paper-dialog>
        `;
    }

    static get is() {
        return 'rester-multi-delete-dialog';
    }

    static get properties() {
        return {
            isWorking: {
                type: Boolean,
                value: false,
                readOnly: true,
            },
            requests: {
                type: Array,
                value: [],
                readOnly: true,
            },
        };
    }

    static get resterDialogId() {
        return 'multiDelete';
    }

    async _onOpened() {
        // Clear old data
        this._setRequests([]);
        this.$.dialog.notifyResize();

        // Load new data
        this._setIsWorking(true);
        const requests = await getRequests(['id', 'collection', 'title']);
        const collections = Array.from(
            new Set(
                requests.flatMap((r) =>
                    r.collection
                        .split(/\s*\/\s*/i)
                        .map((_part, i, parts) =>
                            parts.slice(0, i + 1).join(' / ')
                        )
                )
            )
        ).sort();
        console.log(collections);
        const items = collections.map((collection) => ({
            title: collection,
            checked: false,
            children: requests
                .filter((r) => r.collection === collection)
                .map((r) => ({
                    id: r.id,
                    title: r.title,
                    checked: false,
                })),
        }));
        for (let i = items.length - 1; i >= 1; i--) {
            const item = items[i];
            for (let j = i - 1; j >= 0; j--) {
                const prevItem = items[j];
                if (item.title.startsWith(prevItem.title + ' / ')) {
                    items.splice(i, 1);
                    item.title = item.title.substr(
                        (prevItem.title + ' / ').length
                    );
                    prevItem.children.unshift(item);
                    break;
                }
            }
        }
        this._setRequests(items);
        this.$.dialog.notifyResize();
        this._setIsWorking(false);
    }

    async _deleteRequests() {
        this._setIsWorking(true);
        const ids = this._getIds(this.requests);
        try {
            for (const id of ids) {
                await deleteRequest(id);
            }
            this._closeDialogWithAction();
        } catch (e) {
            this.showError(e);
        }

        this._setIsWorking(false);
    }

    _getIds(requests) {
        return requests.flatMap((r) => {
            const ids = [];
            if (r.id && r.checked) {
                ids.push(r.id);
            }
            if (r.children) {
                ids.push(...this._getIds(r.children));
            }
            return ids;
        });
    }
}

customElements.define(RESTerMultiDeleteDialog.is, RESTerMultiDeleteDialog);
