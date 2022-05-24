import { PolymerElement } from '../../../../node_modules/@polymer/polymer/polymer-element.js';
import { html } from '../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js';
import '../../../../node_modules/@polymer/app-layout/app-header-layout/app-header-layout.js';
import '../../../../node_modules/@polymer/app-layout/app-header/app-header.js';
import '../../../../node_modules/@polymer/app-layout/app-toolbar/app-toolbar.js';
import '../../../../node_modules/@polymer/app-route/app-route.js';
import '../../../../node_modules/@polymer/iron-form/iron-form.js';
import '../../../../node_modules/@polymer/iron-icon/iron-icon.js';
import '../../../../node_modules/@polymer/iron-media-query/iron-media-query.js';
import '../../../../node_modules/@polymer/iron-pages/iron-pages.js';
import '../../../../node_modules/@polymer/paper-button/paper-button.js';
import '../../../../node_modules/@polymer/paper-icon-button/paper-icon-button.js';
import '../../../../node_modules/@polymer/paper-item/paper-item.js';
import '../../../../node_modules/@polymer/paper-listbox/paper-listbox.js';
import '../../../../node_modules/@polymer/paper-menu-button/paper-menu-button.js';
import '../../../../node_modules/@polymer/paper-spinner/paper-spinner.js';
import '../../../../node_modules/@polymer/paper-tabs/paper-tabs.js';
import '../../../../node_modules/@polymer/paper-tooltip/paper-tooltip.js';
import '../controls/rester-authorization-input.js';
import '../controls/rester-autocomplete-input.js';
import '../controls/rester-body-input.js';
import '../controls/rester-header-input.js';
import '../controls/rester-highlight-body.js';
import '../controls/rester-highlight-headers.js';
import '../controls/rester-request-title-input.js';
import '../controls/rester-url-input.js';
import '../controls/rester-variables-input.js';
import '../styles/rester-icons.js';
import resterPageStyle from '../styles/rester-page.js';
import '../utils/rester-badge.js';
import '../utils/rester-lint-messages.js';
import dialogs from '../data/scripts/dialogs.js';
import { mapFilesToVariableValues } from '../data/scripts/encode.js';
import { duration, size, dateTime } from '../data/scripts/format.js';
import { getSingle } from '../data/scripts/navigation.js';
import { send } from '../data/scripts/request.js';
import {
    addHistoryEntry,
    deleteRequest,
    getHistoryEntry,
    getRequest,
    putRequest,
} from '../data/scripts/rester.js';
import { cloneDeep, parseMediaType } from '../../../shared/util.js';
import {
    replace as replaceVariables,
    extract as extractVariables,
} from '../data/scripts/variables.js';
import RESTerErrorMixin from '../utils/rester-error-mixin.js';
import RESTerLintMixin from '../utils/rester-lint-mixin.js';
import RESTerPageMixin from '../layout/rester-page-mixin.js';
import RESTerHotkeysMixin from '../data/rester-data-hotkeys-mixin.js';
import RESTerSettingsMixin from '../data/rester-data-settings-mixin.js';

/**
 * @appliesMixin RESTerLintMixin
 * @appliesMixin RESTerErrorMixin
 * @appliesMixin RESTerPageMixin
 * @appliesMixin RESTerSettingsMixin
 * @appliesMixin RESTerHotkeysMixin
 * @polymer
 * @customElement
 */
class RESTerPageRequest extends RESTerLintMixin(
    RESTerErrorMixin(
        RESTerPageMixin(RESTerSettingsMixin(RESTerHotkeysMixin(PolymerElement)))
    )
) {
    static get template() {
        return html`
            ${resterPageStyle}

            <style>
                :host {
                    display: block;

                    --paper-tabs-selection-bar-color: var(--accent-color);
                    --paper-tab-ink: var(--accent-color);
                    --paper-tab: {
                        padding: 0 24px;
                        text-transform: uppercase;
                    }
                }

                :host([request-show-variables-on-side]) [role='main'] {
                    max-width: 1200px;
                }

                :host([page-full-width]) [role='main'] {
                    max-width: none;
                }

                [hidden] {
                    display: none !important;
                }

                .title-input {
                    flex: 1;
                }

                paper-menu-button {
                    padding: 0;
                }

                .request-form {
                    display: flex;
                    flex-direction: row;
                }

                .form-area-main {
                    flex: 3;
                }

                .form-area-url {
                    display: flex;
                    flex-direction: row;
                    align-items: baseline;
                    justify-content: space-between;
                }

                .method-input,
                .url-input,
                .is-sending-spinner {
                    margin-right: 16px;
                }

                .url-input {
                    flex: 1;
                }

                .is-sending-spinner,
                .send-button {
                    top: 18px;
                }

                .send-button:not([disabled]) {
                    background-color: var(--accent-color);
                    color: var(--light-theme-text-color);
                }

                .form-area-tabs {
                    display: flex;
                    flex-direction: row;
                    margin-top: 8px;
                }

                .form-area-side {
                    flex: 1;
                    flex-basis: 0.000000001px;
                    margin-top: 8px;
                    margin-left: 32px;
                }

                .response-header {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                }

                .redirected-info {
                    margin-left: 1em;
                    display: flex;
                    align-items: center;
                }

                .redirected-info-help-button {
                    width: 36px;
                    height: 36px;
                }

                .network-info-button-container {
                    margin-left: auto;
                }

                .network-info-button {
                    text-transform: none;
                }

                .network-info-button iron-icon {
                    margin-right: 4px;
                }

                rester-lint-messages {
                    position: fixed;
                    bottom: 0;
                    right: 0;
                    z-index: 10;
                }
            </style>

            <app-route
                route="[[route]]"
                pattern="/:requestId"
                active="{{routeActive}}"
                data="{{routeData}}"
                tail="{{historyRoute}}"
            ></app-route>
            <app-route
                route="[[historyRoute]]"
                pattern="/history/:historyId"
                active="{{historyRouteActive}}"
                data="{{historyRouteData}}"
            ></app-route>

            <app-header-layout>
                <app-header slot="header" fixed shadow>
                    <app-toolbar>
                        <paper-icon-button
                            icon="menu"
                            paper-drawer-toggle
                        ></paper-icon-button>
                        <div main-title hidden>
                            [[request.collection]] / [[request.title]]
                        </div>
                        <rester-request-title-input
                            request-collection="{{request.collection}}"
                            request-title="{{request.title}}"
                            class="title-input"
                        ></rester-request-title-input>
                        <paper-icon-button
                            id="save-request-button"
                            icon="save"
                            on-tap="_saveRequest"
                        ></paper-icon-button>
                        <paper-tooltip
                            for="save-request-button"
                            animation-delay="300"
                            >Save request</paper-tooltip
                        >
                        <paper-menu-button
                            id="deleteOptions"
                            horizontal-align="right"
                            restore-focus-on-close
                            hidden$="[[!request.id]]"
                        >
                            <paper-icon-button
                                id="delete-request-button"
                                slot="dropdown-trigger"
                                icon="delete"
                            ></paper-icon-button>
                            <paper-listbox
                                slot="dropdown-content"
                                selectable="[role='menuitemradio']"
                            >
                                <paper-item
                                    role="menuitem"
                                    on-tap="_deleteRequest"
                                    >Delete request</paper-item
                                >
                            </paper-listbox>
                        </paper-menu-button>
                        <paper-tooltip
                            for="delete-request-button"
                            animation-delay="300"
                            >Delete request</paper-tooltip
                        >
                        <paper-menu-button
                            id="moreOptions"
                            horizontal-align="right"
                            restore-focus-on-close
                        >
                            <paper-icon-button
                                id="request-menu-button"
                                slot="dropdown-trigger"
                                icon="more-vert"
                            ></paper-icon-button>
                            <paper-listbox
                                slot="dropdown-content"
                                selectable="[role='menuitemradio']"
                            >
                                <paper-item
                                    role="menuitem"
                                    hidden$="[[!request.id]]"
                                    on-tap="_duplicateRequest"
                                    >Duplicate request</paper-item
                                >
                                <paper-item
                                    role="menuitem"
                                    on-tap="_showCurlCommandDialog"
                                    >Show curl command</paper-item
                                >
                                <paper-item
                                    role="menuitem"
                                    on-tap="_openRequestInNewTab"
                                    >Send Request In New Tab</paper-item
                                >
                            </paper-listbox>
                        </paper-menu-button>
                        <paper-tooltip
                            for="request-menu-button"
                            animation-delay="300"
                            >More options</paper-tooltip
                        >
                    </app-toolbar>
                </app-header>
                <div role="main">
                    <!-- Request -->
                    <section>
                        <iron-form id="requestForm" on-keydown="_onFormKeyDown">
                            <form class="request-form">
                                <iron-media-query
                                    query="(min-width: 1279px)"
                                    query-matches="{{isWideEnoughToShowVariablesOnSide}}"
                                ></iron-media-query>

                                <div class="form-area-main">
                                    <div class="form-area-url">
                                        <rester-autocomplete-input
                                            class="method-input"
                                            label="Method"
                                            value="{{request.method}}"
                                            items="[[requestMethods]]"
                                            required
                                        ></rester-autocomplete-input>
                                        <rester-url-input
                                            class="url-input"
                                            label="URL"
                                            value="{{request.url}}"
                                            required
                                        ></rester-url-input>
                                        <paper-spinner
                                            class="is-sending-spinner"
                                            active
                                            hidden$="[[!requestIsSending]]"
                                        ></paper-spinner>
                                        <paper-button
                                            class="send-button"
                                            raised
                                            type="submit"
                                            on-tap="_sendRequest"
                                            disabled$="[[requestIsSending]]"
                                            hidden$="[[requestIsSendingAndAbortable]]"
                                            >Send</paper-button
                                        >
                                        <paper-button
                                            class="send-button"
                                            raised
                                            type="submit"
                                            on-tap="_abortRequest"
                                            hidden$="[[!requestIsSendingAndAbortable]]"
                                            >Abort</paper-button
                                        >
                                    </div>

                                    <div class="form-area-tabs">
                                        <paper-tabs
                                            selected="{{requestSelectedTab}}"
                                        >
                                            <paper-tab id="requestTab0"
                                                >Headers</paper-tab
                                            >
                                            <paper-tab id="requestTab1"
                                                >Body</paper-tab
                                            >
                                            <paper-tab id="requestTab2"
                                                >Authorization</paper-tab
                                            >
                                            <template
                                                is="dom-if"
                                                if="[[!requestShowVariablesOnSide]]"
                                            >
                                                <paper-tab id="requestTab3"
                                                    >Variables</paper-tab
                                                >
                                            </template>
                                        </paper-tabs>
                                    </div>
                                    <iron-pages
                                        selected="[[requestSelectedTab]]"
                                    >
                                        <div
                                            role="tabpanel"
                                            aria-labelledby="requestTab0"
                                        >
                                            <rester-header-input
                                                value="{{request.headers}}"
                                            ></rester-header-input>
                                        </div>
                                        <div
                                            role="tabpanel"
                                            aria-labelledby="requestTab1"
                                        >
                                            <rester-body-input
                                                id="bodyInput"
                                                value="{{request.body}}"
                                                content-type="[[requestContentType]]"
                                            ></rester-body-input>
                                        </div>
                                        <div
                                            role="tabpanel"
                                            aria-labelledby="requestTab2"
                                        >
                                            <rester-authorization-input
                                                authorization="[[requestAuthorization]]"
                                                on-authorization-changed="_onRequestAuthorizationChanged"
                                            ></rester-authorization-input>
                                        </div>
                                        <template
                                            is="dom-if"
                                            if="[[!requestShowVariablesOnSide]]"
                                        >
                                            <div
                                                role="tabpanel"
                                                aria-labelledby="requestTab3"
                                            >
                                                <rester-variables-input
                                                    value="{{requestVariableValues}}"
                                                    source-obj="[[request]]"
                                                >
                                                </rester-variables-input>
                                            </div>
                                        </template>
                                    </iron-pages>
                                </div>

                                <template
                                    is="dom-if"
                                    if="[[requestShowVariablesOnSide]]"
                                >
                                    <div class="form-area-side">
                                        <rester-variables-input
                                            value="{{requestVariableValues}}"
                                            source-obj="[[request]]"
                                        >
                                        </rester-variables-input>
                                    </div>
                                </template>
                            </form>
                        </iron-form>
                    </section>

                    <!-- Response -->
                    <section hidden$="[[!response]]">
                        <header class="response-header">
                            <h2>Response</h2>
                            <rester-badge type="[[responseBadgeType]]"
                                >[[response.status]]
                                [[response.statusText]]</rester-badge
                            >
                            <template is="dom-if" if="[[response.redirected]]">
                                <small class="redirected-info">
                                    redirected
                                    <paper-icon-button
                                        id="redirected-info-help-button"
                                        class="redirected-info-help-button"
                                        icon="help-outline"
                                        on-tap="_showResponseRedirectedHelp"
                                    ></paper-icon-button>
                                    <paper-tooltip
                                        for="redirected-info-help-button"
                                        >What does that mean?</paper-tooltip
                                    >
                                </small>
                            </template>
                            <div class="network-info-button-container">
                                <paper-button
                                    class="network-info-button"
                                    on-tap="_showHistoryEntrySizeDetails"
                                    hidden$="[[!historyEntry.timing]]"
                                >
                                    <iron-icon icon="storage"></iron-icon>
                                    [[historyEntrySize]]
                                </paper-button>
                                <paper-button
                                    class="network-info-button"
                                    on-tap="_showHistoryEntryDurationDetails"
                                >
                                    <iron-icon icon="timer"></iron-icon>
                                    [[historyEntryDuration]]
                                </paper-button>
                            </div>
                        </header>
                        <rester-highlight-headers
                            headers="[[response.headers]]"
                        ></rester-highlight-headers>
                        <rester-highlight-body
                            body="[[response.body]]"
                            content-type="[[responseContentType]]"
                            hidden$="[[!response.body]]"
                        ></rester-highlight-body>
                    </section>
                </div>
            </app-header-layout>

            <rester-lint-messages></rester-lint-messages>
        `;
    }

    static get is() {
        return 'rester-page-request';
    }

    static get properties() {
        return {
            route: {
                type: Object,
                observer: '_onRouteChanged',
            },
            routeActive: Boolean,
            routeData: Object,
            historyRoute: Object,
            historyRouteActive: Boolean,
            historyRouteData: Object,
            pageFullWidth: {
                type: Boolean,
                computed:
                    '_computePageFullWidth(settings.requestPageFullWidth)',
                reflectToAttribute: true,
            },
            isWideEnoughToShowVariablesOnSide: Boolean,
            request: {
                type: Object,
                readOnly: true,
            },
            requestVariableValues: {
                type: Object,
            },
            requestMethods: {
                type: Array,
                readOnly: true,
                value: [
                    'DELETE',
                    'GET',
                    'HEAD',
                    'OPTIONS',
                    'PATCH',
                    'POST',
                    'PUT',
                ],
            },
            requestIsSending: {
                type: Boolean,
                readOnly: true,
                value: false,
            },
            requestIsSendingAndAbortable: {
                type: Boolean,
                computed:
                    '_computeRequestIsSendingAndAbortable(requestIsSending)',
            },
            requestShowVariablesOnSide: {
                type: Boolean,
                computed:
                    '_computeRequestShowVariablesOnSide(settings.showVariablesOnSide, isWideEnoughToShowVariablesOnSide)',
                reflectToAttribute: true,
            },
            requestSelectedTab: {
                type: Number,
                value: 0,
                observer: '_onRequestSelectedTabChanged',
            },
            requestContentType: {
                type: String,
                computed: "_computeHeader(request.headers.*, 'Content-Type')",
            },
            requestAuthorization: {
                type: String,
                computed: '_computeRequestAuthorization(request.headers.*)',
            },
            response: {
                type: Object,
                readOnly: true,
            },
            responseBadgeType: {
                type: String,
                computed: '_computeResponseBadgeType(response.status)',
            },
            responseContentType: {
                type: String,
                computed: "_computeHeader(response.headers.*, 'Content-Type')",
            },
            historyEntry: {
                type: Object,
                readOnly: true,
            },
            historyEntrySize: {
                type: Number,
                computed: '_computeHistoryEntrySize(historyEntry.timing)',
            },
            historyEntryDuration: {
                type: Number,
                computed:
                    '_computeHistoryEntryDuration(historyEntry.time, historyEntry.timeEnd, historyEntry.timing)',
            },
        };
    }

    static get observers() {
        return [
            '_updatePageTitle(request, historyEntry)',
            '_runLintInspections(request.*, requestVariableValues.*)',
        ];
    }

    static get resterHotkeys() {
        return {
            'mod+s': {
                description: 'Save the current request.',
                callback: '_saveRequest',
            },
            'mod+enter': {
                description: 'Send the current request.',
                callback: '_sendRequest',
            },
        };
    }

    static get resterLintInspections() {
        return [
            {
                message: 'Some variables have an empty value.',
                check: '_lintCheckEmptyVariables',
                fixLabel: 'View variables',
                fix: '_lintFixEmptyVariables',
            },
            {
                message:
                    'There are files selected, but the content type is not set to multipart/form-data. Files will be ignored.',
                check: '_lintCheckFilesWithoutMultipart',
                fixLabel: 'Change content type',
                fix: '_lintFixFilesWithoutMultipart',
            },
            {
                message: 'There are empty file inputs.',
                check: '_lintCheckEmptyFiles',
                fixLabel: 'View body',
                fix: '_lintFixEmptyFiles',
            },
            {
                message:
                    'Suggested content type based on body is {contentType}.',
                check: '_lintCheckSuggestedContentType',
                fixLabel: 'Set content type',
                fix: '_lintFixSuggestedContentType',
            },
        ];
    }

    constructor() {
        super();
        this._requestAbortController = null;
    }

    _onRouteChanged() {
        if (this.routeActive && this.historyRouteActive) {
            getHistoryEntry(+this.historyRouteData.historyId).then(
                (historyEntry) => {
                    if (
                        historyEntry.request.id !== +this.routeData.requestId &&
                        !(
                            historyEntry.request.id === undefined &&
                            this.routeData.requestId === ''
                        )
                    ) {
                        this.showError(
                            `Specified request id "${this.historyRouteData.historyId}" does not match the request id of the history entry "${historyEntry.request.id}".`
                        );
                        window.location = '#/';
                    } else {
                        if (
                            historyEntry.request.variables &&
                            historyEntry.request.variables.values
                        ) {
                            this.requestVariableValues =
                                historyEntry.request.variables.values;
                            delete historyEntry.request.variables.values;
                        } else {
                            this.requestVariableValues = {};
                        }

                        this._setHistoryEntry(historyEntry);
                        this._setRequest(historyEntry.request);
                        this._setResponse(historyEntry.response);
                    }
                }
            );
        } else if (this.routeActive) {
            getRequest(+this.routeData.requestId).then((request) => {
                this._setHistoryEntry(null);
                this._setRequest(request);
                this.requestVariableValues = {};
                this._setResponse(null);
            });
        } else {
            this._setHistoryEntry(null);
            this._setRequest({
                collection: '',
                title: '',
                method: '',
                url: '',
                headers: [],
                body: '',
                variables: {
                    enabled: false,
                },
            });
            this.requestVariableValues = {};
            this._setResponse(null);
        }
    }

    _computePageFullWidth(requestPageFullWidth) {
        return requestPageFullWidth;
    }

    _onRequestSelectedTabChanged() {
        if (this.requestSelectedTab === 1) {
            this.$.bodyInput.notifyVisibilityChanged();
        }
    }

    _computeRequestShowVariablesOnSide(setting, isWideEnough) {
        return setting && isWideEnough;
    }

    _computeRequestIsSendingAndAbortable(isSending) {
        return isSending && this._requestAbortController;
    }

    _computeRequestAuthorization(headers) {
        const authorization = this._computeHeader(headers, 'Authorization');
        if (authorization) {
            return {
                scheme: authorization.substr(0, authorization.indexOf(' ')),
                token: authorization.substr(authorization.indexOf(' ') + 1),
            };
        }

        const cookie = this._computeHeader(headers, 'Cookie');
        if (cookie) {
            return {
                scheme: 'Cookie',
                token: cookie,
            };
        }

        return null;
    }

    _computeHeader(headers, headerName) {
        if (!headers || !headers.base) {
            return;
        }

        let header = headers.base.find(
            (h) => h.name.toLowerCase() === headerName.toLowerCase()
        );

        return header && header.value;
    }

    _computeResponseBadgeType(status) {
        if (status >= 100 && status < 200) {
            return 'info';
        } else if (status >= 200 && status < 300) {
            return 'success';
        } else if (status >= 300 && status < 400) {
            return 'warn';
        } else if (status >= 400) {
            return 'error';
        }
    }

    _computeHistoryEntryDuration(time, timeEnd, timing) {
        const millis = timing
            ? timing.duration
            : new Date(timeEnd) - new Date(time);

        return duration(millis, 0);
    }

    _computeHistoryEntrySize(timing) {
        if (timing) {
            return size(timing.transferSize);
        }
    }

    _updatePageTitle(request, historyEntry) {
        if (!request) {
            return;
        }

        const collection = request.collection || '<no collection>';
        const title = request.title || '<no title>';
        const time =
            historyEntry && historyEntry.time
                ? dateTime(historyEntry.time)
                : '';

        let pageTitle = `${collection} / ${title}`;
        if (time) {
            pageTitle += ` (${time})`;
        }

        this._setPageTitle(pageTitle);
    }

    _onFormKeyDown(e) {
        // Do not intercept Enter presses inside of a textarea. In this case you
        // could no longer enter newlines, which is not what we want.
        const nodeName = e.composedPath
            ? e.composedPath()[0].nodeName.toUpperCase()
            : e.target.nodeName.toUpperCase();
        if (
            !e.defaultPrevented &&
            nodeName !== 'TEXTAREA' &&
            e.key === 'Enter'
        ) {
            e.preventDefault();
            this._sendRequest();
        }
    }

    _onRequestAuthorizationChanged(e) {
        const auth = e.detail.value;
        const flag = 'authorization';
        if (!auth) {
            this._setRequestHeader('Authorization', null, flag);
            this._setRequestHeader('Cookie', null, flag);
        } else if (auth.scheme === 'Cookie') {
            this._setRequestHeader('Authorization', null, flag);
            this._setRequestHeader('Cookie', auth.token, flag);
        } else {
            this._setRequestHeader(
                'Authorization',
                `${auth.scheme} ${auth.token}`,
                flag
            );
            this._setRequestHeader('Cookie', null, flag);
        }
    }

    _setRequestHeader(headerName, value, flag) {
        const valueSet = value !== null && value !== undefined;
        const flagSet = flag !== null && flag !== undefined;

        for (let i = this.request.headers.length - 1; i >= 0; i--) {
            const header = this.request.headers[i];
            if (
                header.name.toLowerCase() === headerName.toLowerCase() &&
                (valueSet || !flagSet || header.flag === flag)
            ) {
                this.request.headers.splice(i, 1);
            }
        }

        if (valueSet) {
            const newHeader = {
                name: headerName,
                value: value,
                flag,
            };

            this.request.headers.push(newHeader);
        }

        this.set('request.headers', [...this.request.headers]);
    }

    _saveRequest() {
        if (!this.request.title || !this.request.collection) {
            this.showError(
                'Please enter a Collection and Title for your request in blue bar at the top.',
                'Missing Title'
            );
            return;
        }

        putRequest(this.request).then((id) => {
            if (this.historyEntry && this.historyEntry.request.id === id) {
                window.location = `#/request/${id}/history/${this.historyEntry.id}`;
            } else {
                window.location = `#/request/${id}`;
            }
        });
    }

    _duplicateRequest() {
        this.$.moreOptions.close();
        delete this.request.id;
        this._saveRequest();
    }

    _deleteRequest() {
        this.$.deleteOptions.close();

        const nextId = getSingle().getNextRequestId(this.request.id);
        deleteRequest(this.request.id).then(() => {
            if (typeof nextId !== 'undefined') {
                window.location = `#/request/${nextId}`;
            } else {
                window.location = `#/`;
            }
        });
    }

    _compileRequest() {
        const usedVariableValues = {};
        const compile = (obj, encodeFn = undefined) =>
            replaceVariables(
                obj,
                this.requestVariableValues,
                usedVariableValues,
                encodeFn
            );
        const compiledRequest = {
            ...this.request,
            collection: compile(this.request.collection),
            title: compile(this.request.title),
            method: compile(this.request.method),
            url: compile(this.request.url),
            headers: compile(this.request.headers),
            body: compile(this.request.body, (value) =>
                this.$.bodyInput.maybeEncodeVariableValue(value)
            ),
        };

        // Prefix with http://, if the compiled URL does not contain any protocol.
        if (!/^[A-Za-z][A-Za-z0-9+-.]*:\/\/*/i.test(compiledRequest.url)) {
            compiledRequest.url = 'http://' + compiledRequest.url;
        }

        if (this.settings.stripDefaultHeaders) {
            compiledRequest.stripDefaultHeaders = true;
        }

        compiledRequest.tempVariables = {
            values: mapFilesToVariableValues(this.$.bodyInput.files || {}),
        };

        return {
            compiledRequest,
            usedVariableValues,
        };
    }

    _showCurlCommandDialog() {
        this.$.moreOptions.close();
        const { compiledRequest } = this._compileRequest();
        dialogs.curlCommand.show(compiledRequest);
    }

    _openRequestInNewTab() {
        this.$.moreOptions.close();
        const { compiledRequest } = this._compileRequest();
        window.open(compiledRequest.url, '_blank').focus();
    }

    _sendRequest() {
        if (!this.$.requestForm.validate()) {
            return;
        }

        const { compiledRequest, usedVariableValues } = this._compileRequest();

        if (window.AbortController) {
            this._requestAbortController = new AbortController();
            compiledRequest.signal = this._requestAbortController.signal;
        }

        this._setRequestIsSending(true);
        return send(compiledRequest)
            .then((plainResponse) => {
                const requestClone = cloneDeep(this.request);
                requestClone.variables.values = usedVariableValues;

                const response = {
                    status: plainResponse.status,
                    statusText: plainResponse.statusText,
                    headers: plainResponse.headers,
                    body: plainResponse.body,
                    redirected: plainResponse.redirected,
                };

                return addHistoryEntry({
                    time: new Date(plainResponse.timeStart),
                    timeEnd: new Date(plainResponse.timeEnd),
                    timing: plainResponse.timing,
                    request: requestClone,
                    response: response,
                });
            })
            .then((historyId) => {
                this._setRequestIsSending(false);
                window.location = `#/request/${
                    this.request.id || ''
                }/history/${historyId}`;
            })
            .catch((error) => {
                this._setRequestIsSending(false);
                if (error.name !== 'AbortError') {
                    this.showError(error, null, [
                        'Is the URL correct?',
                        'Is your network connection working?',
                        'Could this be caused by an invalid HTTPS certificate? If so, try to open the URL in a new tab and accept the certificate warning. Then try the request in RESTer again.',
                    ]);
                }
            });
    }

    _abortRequest() {
        if (this._requestAbortController) {
            this._requestAbortController.abort();
        }
    }

    _showResponseRedirectedHelp() {
        dialogs.redirectedHelp.show();
    }

    _showHistoryEntrySizeDetails() {
        const timing = this.historyEntry.timing;
        dialogs.timingSize.show(timing);
    }

    _showHistoryEntryDurationDetails() {
        const timing = this.historyEntry.timing;
        dialogs.timingDuration.show(timing);
    }

    _lintCheckEmptyVariables() {
        if (
            this.request === undefined ||
            this.requestVariableValues === undefined
        ) {
            return false;
        }

        const variables = extractVariables(this.request);
        const usedVariableValues = {};
        replaceVariables(
            this.request,
            this.requestVariableValues,
            usedVariableValues
        );
        return variables.some((name) => !usedVariableValues[name]);
    }

    _lintFixEmptyVariables() {
        this.requestSelectedTab = 3;
    }

    _lintCheckFilesWithoutMultipart() {
        if (this.request === undefined) {
            return false;
        }

        const contentType = this.requestContentType || '';
        const requiredFiles =
            this.request.body &&
            this.request.body.match(/\[\$file\.[^}]*?\]/gi);

        return (
            contentType.toLowerCase() !== 'multipart/form-data' &&
            requiredFiles &&
            requiredFiles.length > 0
        );
    }

    _lintFixFilesWithoutMultipart() {
        this._setRequestHeader('Content-Type', 'multipart/form-data');
    }

    _lintCheckEmptyFiles() {
        if (this.request === undefined) {
            return false;
        }

        const requiredFiles =
            this.request.body &&
            this.request.body.match(/\[\$file\.[^}]*?\]/gi);
        const selectedFiles = this.$.bodyInput.files;

        return (
            requiredFiles &&
            requiredFiles
                .map((file) => file.substring(7, file.length - 1))
                .some((file) => !selectedFiles[file])
        );
    }

    _lintFixEmptyFiles() {
        this.requestSelectedTab = 1;
    }

    _lintCheckSuggestedContentType() {
        if (this.request === undefined || !this.request.body) {
            return false;
        }

        const contentType = parseMediaType(this.requestContentType || '').type;
        const suggested = this.$.bodyInput.getSuggestedContentType();

        if (
            suggested &&
            suggested !== contentType.toLowerCase() &&
            !this._lintCheckFilesWithoutMultipart() &&
            !this._lintCheckEmptyFiles()
        ) {
            return {
                contentType: suggested,
            };
        }
    }

    _lintFixSuggestedContentType() {
        const suggested = this.$.bodyInput.getSuggestedContentType();

        this._setRequestHeader('Content-Type', suggested);
    }
}

customElements.define(RESTerPageRequest.is, RESTerPageRequest);
