import { PolymerElement } from '../../../../node_modules/@polymer/polymer/polymer-element.js';
import { html } from '../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js';
import { microTask } from '../../../../node_modules/@polymer/polymer/lib/utils/async.js';
import '../../../../node_modules/@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
import '../../../../node_modules/@polymer/paper-icon-button/paper-icon-button.js';
import '../../../../node_modules/@polymer/paper-input/paper-input.js';
import '../../../../node_modules/@polymer/paper-input/paper-textarea.js';
import '../../../../node_modules/@polymer/paper-item/paper-item.js';
import '../../../../node_modules/@polymer/paper-listbox/paper-listbox.js';
import '../styles/rester-icons.js';
import './rester-file-input.js';
import { encodeFormValue } from '../data/scripts/encode.js';

/**
 * @polymer
 * @customElement
 */
class RESTerFormDataInput extends PolymerElement {
    static get template() {
        return html`
            <style>
                :host {
                    display: block;
                }

                .form-data-entry-line {
                    display: flex;
                    flex-direction: row;
                    align-items: flex-start;
                }

                .form-data-entry-line paper-input {
                    flex: 1;
                    flex-basis: 0.000000001px;
                }

                .form-data-entry-line paper-input,
                .form-data-entry-line paper-textarea,
                .form-data-entry-line rester-file-input {
                    margin-right: 16px;
                    overflow: hidden;
                    width: 0;
                }

                .form-data-entry-line paper-textarea {
                    flex: 2;
                }

                .form-data-entry-line rester-file-input {
                    flex: 2;
                    align-self: flex-end;
                }

                .form-data-entry-line paper-dropdown-menu {
                    width: 100px;
                }

                .form-data-entry-line paper-icon-button {
                    margin-top: 19px;
                }
            </style>

            <template id="repeat" is="dom-repeat" items="[[formDataEntries]]">
                <div class="form-data-entry-line">
                    <paper-input label="Name" value="{{item.name}}" on-value-changed="_onFormDataEntriesChanged"></paper-input>
                    <template is="dom-if" if="[[_isFormDataType(item.type, 'text')]]">
                        <paper-textarea label="Value" value="{{item.value}}" on-value-changed="_onFormDataEntriesChanged"></paper-textarea>
                    </template>
                    <template is="dom-if" if="[[_isFormDataType(item.type, 'file')]]">
                        <rester-file-input override-value="[[item.value]]" on-file-changed="_onFormDataEntryFileSelected"></rester-file-input>
                    </template>
                    <template is="dom-if" if="[[!textOnly]]">
                        <paper-dropdown-menu label="Type">
                            <paper-listbox slot="dropdown-content" selected="{{item.type}}" attr-for-selected="value">
                                <paper-item value="text">Text</paper-item>
                                <paper-item value="file">File</paper-item>
                            </paper-listbox>
                        </paper-dropdown-menu>
                    </template>
                    <paper-icon-button icon="remove" on-tap="_removeFormDataEntry"></paper-icon-button>
                </div>
            </template>
        `;
    }

    static get is() {
        return 'rester-form-data-input';
    }

    static get properties() {
        return {
            value: {
                type: String,
                notify: true,
                observer: '_onValueChanged'
            },
            files: {
                type: Object,
                notify: true,
                readOnly: true,
                value: {}
            },
            noEncode: {
                type: Boolean,
                value: false
            },
            textOnly: {
                type: Boolean,
                value: false
            },
            formDataEntries: {
                type: Array,
                readOnly: true
            }
        };
    }

    constructor() {
        super();
        this._ignoreFormDataEntryChangedEvents = false;
    }

    _onValueChanged() {
        this._setFormDataEntries(this._parseFormDataEntries(this.value));
        this._cleanUpUnusedFiles();
        this._ensureEmptyFormDataEntry();
    }

    _onFormDataEntriesChanged() {
        // Async ensures, this event is triggered after item.name and item.value
        // properties have been updated.
        microTask.run(() => {
            this.value = this._stringifyFormDataEntries(this.formDataEntries);
            this._ensureEmptyFormDataEntry();
        });
    }

    _onFormDataEntryFileSelected(e) {
        const file = e.target.file;
        const index = this.$.repeat.indexForElement(e.target);
        const oldValue = this.get(['formDataEntries', index, 'value']);

        if (oldValue) {
            delete this.files[oldValue];
            this.notifyPath(['files', oldValue]);
        }

        if (file) {
            let name = file.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            if (this._isFileNameInUse(name, index)) {
                let suffix;
                for (
                    suffix = 1;
                    this._isFileNameInUse(name + suffix, index);
                    suffix++
                ) {
                    // empty
                }

                name += suffix;
            }

            this.set(['files', name], file);
            this.set(['formDataEntries', index, 'value'], name);
        } else {
            this.set(['formDataEntries', index, 'value'], '');
        }

        this._onFormDataEntriesChanged();
    }

    _ensureEmptyFormDataEntry() {
        if (
            !this.formDataEntries.some(
                e => e.name.trim() === '' && e.value.trim() === ''
            )
        ) {
            this.push('formDataEntries', { name: '', value: '', type: 'text' });
        }
    }

    _removeFormDataEntry(e) {
        this.splice('formDataEntries', e.model.index, 1);
        this._onFormDataEntriesChanged();
    }

    _isFormDataType(selectedType, comparedType) {
        return selectedType === comparedType;
    }

    _stringifyFormDataEntries(entries) {
        const encode =
            !this.noEncode || this._isEncodeNeeded(entries)
                ? encodeFormValue
                : str => str;

        return entries
            .filter(entry => entry.name.trim())
            .map(entry => {
                let str = encode(entry.name);
                if (entry.type === 'file') {
                    str += '=' + `[$file.${entry.value}]`;
                } else if (entry.value) {
                    str += '=' + encode(entry.value);
                }

                return str;
            })
            .join('&');
    }

    _parseFormDataEntries(str) {
        return (str || '')
            .split('&')
            .map(row => {
                const keyValue = row.split('=');
                const name = decodeURIComponent(keyValue[0]);
                const value = decodeURIComponent(keyValue[1] || '');
                const fileMatch = /^\[\$file\.([^}]*)\]$/gi.exec(value);

                if (fileMatch && !this.textOnly) {
                    let fileName = fileMatch[1];
                    if (!this.files[fileName]) {
                        fileName = null;
                    }

                    return { name, value: fileName, type: 'file' };
                } else {
                    return { name, value, type: 'text' };
                }
            })
            .filter(row => row.name.trim());
    }

    _cleanUpUnusedFiles() {
        for (let key in this.files) {
            if (this.files.hasOwnProperty(key) && !this._isFileNameInUse(key)) {
                delete this.files[key];
                this.notifyPath(['files', key]);
            }
        }
    }

    _isEncodeNeeded(entries) {
        return entries.some(
            entry =>
                entry.name.includes('&') ||
                entry.name.includes('=') ||
                entry.value.includes('&') ||
                entry.value.includes('=')
        );
    }

    _isFileNameInUse(name, ignoreIndex) {
        return this.formDataEntries.some(
            (e, i) => i !== ignoreIndex && e.type === 'file' && e.value === name
        );
    }
}

customElements.define(RESTerFormDataInput.is, RESTerFormDataInput);
