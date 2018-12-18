import { PolymerElement } from '../../../../node_modules/@polymer/polymer/polymer-element.js';
import { html } from '../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js';
import '../../../../node_modules/@polymer/app-layout/app-header-layout/app-header-layout.js';
import '../../../../node_modules/@polymer/app-layout/app-header/app-header.js';
import '../../../../node_modules/@polymer/app-layout/app-toolbar/app-toolbar.js';
import '../../../../node_modules/@polymer/paper-button/paper-button.js';
import '../../../../node_modules/@polymer/paper-icon-button/paper-icon-button.js';
import '../../../../node_modules/@polymer/paper-item/paper-item-body.js';
import '../../../../node_modules/@polymer/paper-item/paper-item.js';
import '../../../../node_modules/@polymer/paper-ripple/paper-ripple.js';
import '../../../../node_modules/@polymer/paper-spinner/paper-spinner.js';
import '../../../../node_modules/@polymer/paper-styles/paper-styles.js';
import '../styles/rester-icons.js';
import resterPageStyle from '../styles/rester-page.js';
import resterPaperItemButtonStyle from '../styles/rester-paper-item-button.js';
import { dateTime } from '../data/scripts/format.js';
import {
    getHistoryEntries,
    deleteHistoryEntries
} from '../data/scripts/rester.js';
import { replaceWithoutProvidedValues } from '../data/scripts/variables.js';
import RESTerPageMixin from '../layout/rester-page-mixin.js';

/**
 * @appliesMixin RESTerPageMixin
 * @polymer
 * @customElement
 */
class RESTerPageHistory extends RESTerPageMixin(PolymerElement) {
    static get template() {
        return html`
            ${resterPageStyle} ${resterPaperItemButtonStyle}

            <style>
                :host {
                    display: block;
                }

                paper-item {
                    margin: 8px 0;
                }

                paper-spinner {
                    display: block;
                    margin: 0 auto;
                }

                .button-container {
                    text-align: center;
                }

                .button-container paper-button {
                    background: var(--primary-color);
                    color: var(--light-theme-text-color);
                }
            </style>

            <app-header-layout>
                <app-header slot="header" fixed shadow>
                    <app-toolbar>
                        <paper-icon-button
                            icon="menu"
                            paper-drawer-toggle
                        ></paper-icon-button>
                        <div main-title>[[pageTitle]]</div>
                    </app-toolbar>
                </app-header>
                <div role="main">
                    <template is="dom-repeat" items="[[historyEntries]]">
                        <paper-item class="button">
                            <paper-item-body
                                two-line$="[[!item.request.id]]"
                                three-line$="[[item.request.id]]"
                                on-tap="_openHistoryEntry"
                            >
                                <paper-ripple></paper-ripple>
                                <div>[[item.timeFormatted]]</div>
                                <template is="dom-if" if="[[item.request.id]]">
                                    <div secondary>
                                        [[item.request.collection]] /
                                        [[item.request.title]]
                                    </div>
                                </template>
                                <div secondary>
                                    [[item.request.methodCompiled]]
                                    [[item.request.urlCompiled]]<br />
                                    [[item.response.status]]
                                    [[item.response.statusText]]
                                </div>
                            </paper-item-body>
                            <paper-icon-button
                                icon="delete"
                                alt="Delete history entry"
                                on-tap="_deleteHistoryEntry"
                            ></paper-icon-button>
                        </paper-item>
                    </template>
                    <div hidden$="[[!loading]]">
                        <paper-spinner active></paper-spinner>
                    </div>
                    <div class="button-container" hidden$="[[loading]]">
                        <paper-button
                            raised
                            on-tap="loadAll"
                            hidden$="[[!moreEntriesAvailable]]"
                        >
                            Load all (this may take a while)
                        </paper-button>
                    </div>
                </div>
            </app-header-layout>
        `;
    }

    static get is() {
        return 'rester-page-history';
    }

    static get properties() {
        return {
            historyEntries: {
                type: Array,
                readOnly: true
            },
            moreEntriesAvailable: {
                type: Boolean,
                computed: '_computeMoreEntriesAvailable(historyEntries.length)'
            },
            loading: {
                type: Boolean,
                readOnly: true
            }
        };
    }

    static get historyFields() {
        return [
            'id',
            'time',
            'request.id',
            'request.collection',
            'request.title',
            'request.method',
            'request.url',
            'request.variables',
            'response.status',
            'response.statusText'
        ];
    }

    static get initialCount() {
        return 25;
    }

    ready() {
        super.ready();
        this._setPageTitle('History');
        this._load(RESTerPageHistory.initialCount);
    }

    loadAll() {
        this._load(null);
    }

    _load(count) {
        this._setLoading(true);
        getHistoryEntries(count, RESTerPageHistory.historyFields).then(
            entries => {
                this._setLoading(false);
                this._setHistoryEntries(
                    entries.map(e => {
                        e.timeFormatted = dateTime(e.time);

                        const compiledRequest = replaceWithoutProvidedValues(
                            e.request,
                            e.request.variables.values
                        );

                        e.request.methodCompiled = compiledRequest.method;
                        e.request.urlCompiled = compiledRequest.url;

                        return e;
                    })
                );
            }
        );
    }

    _computeMoreEntriesAvailable() {
        return this.historyEntries.length === RESTerPageHistory.initialCount;
    }

    _openHistoryEntry(e) {
        const entry = e.model.item;
        window.location = `#/request/${entry.request.id || ''}/history/${
            entry.id
        }`;
    }

    _deleteHistoryEntry(e) {
        const entry = e.model.item;
        deleteHistoryEntries(entry.id).then(() => {
            const index = this.historyEntries.indexOf(entry);
            this.splice('historyEntries', index, 1);
        });
    }
}

customElements.define(RESTerPageHistory.is, RESTerPageHistory);
