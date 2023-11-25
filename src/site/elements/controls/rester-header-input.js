import { PolymerElement } from '../../../../node_modules/@polymer/polymer/polymer-element.js';
import { html } from '../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js';
import { microTask } from '../../../../node_modules/@polymer/polymer/lib/utils/async.js';
import '../../../../node_modules/@polymer/paper-icon-button/paper-icon-button.js';
import '../styles/rester-icons.js';
import './rester-autocomplete-input.js';

const COMMON_MIME_TYPES = [
    'application/json',
    'application/x-www-form-urlencoded',
    'application/xhtml+xml',
    'application/xml',
    'text/html',
    'text/plain',
    'text/xml',
];

const REQUEST_HEADERS = [
    'Accept-Charset',
    'Accept-Encoding',
    'Accept-Language',
    'Accept',
    'Access-Control-Request-Headers',
    'Access-Control-Request-Method',
    'Authorization',
    'Cache-Control',
    'Connection',
    'Content-Language',
    'Content-Type',
    'Cookie',
    'Date',
    'DNT',
    'DPR',
    'Early-Data',
    'Expect',
    'Forwarded',
    'From',
    'Host',
    'If-Match',
    'If-Modified-Since',
    'If-None-Match',
    'If-Range',
    'If-Unmodified-Since',
    'Keep-Alive',
    'Max-Forwards',
    'Origin',
    'Pragma',
    'Proxy-Authorization',
    'Range',
    'Referer',
    'Save-Data',
    'TE',
    'Trailer',
    'Transfer-Encoding',
    'Upgrade-Insecure-Requests',
    'Upgrade',
    'User-Agent',
    'Vary',
    'Via',
    'Viewport-Width',
    'Warning',
    'Width',
];

const REQUEST_HEADER_VALUES = {
    Accept: COMMON_MIME_TYPES,
    'Accept-Charset': ['utf-8', 'iso-8859-1'],
    'Accept-Encoding': ['gzip', 'deflate'],
    Authorization: ['Basic ', 'Bearer ', 'Digest '],
    'Cache-Control': ['no-cache'],
    Connection: ['close', 'keep-alive'],
    'Content-Type': [...COMMON_MIME_TYPES, 'multipart/form-data'],
};

/**
 * @polymer
 * @customElement
 */
class RESTerHeaderInput extends PolymerElement {
    static get template() {
        return html`
            <style>
                :host {
                    display: block;
                }

                .header-line {
                    display: flex;
                    flex-direction: row;
                    align-items: flex-start;
                }

                .name {
                    flex: 1;
                    flex-basis: 0.000000001px;
                    margin-right: 16px;
                }

                .value {
                    flex: 2;
                }

                .header-line paper-icon-button {
                    margin-top: 19px;
                }
            </style>

            <template is="dom-repeat" items="[[headers]]">
                <div class="header-line">
                    <rester-autocomplete-input
                        class="name"
                        label="Name"
                        value="{{item.name}}"
                        on-value-changed="_onHeadersChanged"
                        items="[[requestHeaders]]"
                    ></rester-autocomplete-input>
                    <rester-autocomplete-input
                        class="value"
                        label="Value"
                        value="{{item.value}}"
                        on-value-changed="_onHeadersChanged"
                        items="[[_getRequestHeaderValues(item.name)]]"
                    ></rester-autocomplete-input>
                    <paper-icon-button
                        icon="remove"
                        on-tap="_removeHeader"
                    ></paper-icon-button>
                </div>
            </template>
        `;
    }

    static get is() {
        return 'rester-header-input';
    }

    static get properties() {
        return {
            value: {
                type: Array,
                notify: true,
                observer: '_onValueChanged',
            },
            headers: {
                type: Array,
                readOnly: true,
                value: [],
            },
            requestHeaders: {
                type: Array,
                readOnly: true,
                value: REQUEST_HEADERS,
            },
            requestHeaderValues: {
                type: Object,
                readOnly: true,
                value: REQUEST_HEADER_VALUES,
            },
        };
    }

    ready() {
        super.ready();
        this._ensureEmptyHeader();
    }

    _onValueChanged() {
        this._setHeaders([...this.value]);
        this._ensureEmptyHeader();
    }

    _onHeadersChanged() {
        // Async ensures, this event is triggered after item.name and item.value
        // properties have been updated.
        microTask.run(() => {
            this.value = this.headers.filter(
                (header) =>
                    header.name.trim() !== '' || header.value.trim() !== '',
            );
            this._ensureEmptyHeader();
        });
    }

    _ensureEmptyHeader() {
        if (
            !this.headers.some(
                (header) =>
                    header.name.trim() === '' && header.value.trim() === '',
            )
        ) {
            this.push('headers', { name: '', value: '' });
        }
    }

    _removeHeader(e) {
        this.splice('headers', e.model.index, 1);
        this._onHeadersChanged();
    }

    _getRequestHeaderValues(headerName) {
        return this.requestHeaderValues[headerName] || [];
    }
}

customElements.define(RESTerHeaderInput.is, RESTerHeaderInput);
