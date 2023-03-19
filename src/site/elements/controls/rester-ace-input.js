import { PolymerElement } from '../../../../node_modules/@polymer/polymer/polymer-element.js';
import { html } from '../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js';
import '../../../../node_modules/ace-builds/src-min-noconflict/ace.js';
import RESTerThemeMixin from '../data/rester-data-theme-mixin.js';

/**
 * @appliesMixin RESTerThemeMixin
 * @appliesMixin RESTerAceShadowDomMixin
 * @polymer
 * @customElement
 */
class RESTerAceInput extends RESTerThemeMixin(PolymerElement) {
    static get template() {
        return html`
            <style>
                :host {
                    display: block;
                }

                #editor {
                    width: 100%;
                }
            </style>
            <link rel="stylesheet" href="node_modules/ace-builds/css/ace.css" />
            <link
                rel="stylesheet"
                href="node_modules/ace-builds/css/theme/chrome.css"
            />
            <link
                rel="stylesheet"
                href="node_modules/ace-builds/css/theme/twilight.css"
            />

            <div id="editor"></div>
        `;
    }

    static get is() {
        return 'rester-ace-input';
    }

    static get properties() {
        return {
            value: {
                type: String,
                notify: true,
                observer: '_onValueChanged',
            },
            mode: {
                type: String,
                observer: '_onModeChanged',
            },
            readOnly: {
                type: Boolean,
                value: false,
                observer: '_onReadOnlyChanged',
            },
            useWrapMode: {
                type: Boolean,
                value: false,
                observer: '_onUseWrapModeChanged',
            },
            maxLines: {
                type: Number,
                value: 20,
                observer: '_onMaxLinesChanged',
            },
            disableSearch: {
                type: Boolean,
                value: false,
                observer: '_onDisableSearchChanged',
            },
        };
    }

    constructor() {
        super();
        this._editor = undefined;
        this._findCommand = undefined;
        this._oldValue = '';
        this._ignoreEditorChangeEvents = false;
    }

    ready() {
        super.ready();
        ace.config.set('useStrictCSP', true);
        ace.config.set('loadWorkerFromBlob', false);
        const basePath = '/site/node_modules/ace-builds/src-min-noconflict/';
        ace.config.set('basePath', basePath);
        ace.config.set('workerPath', basePath);
        ace.config.set('modePath', basePath);
        ace.config.set('themePath', basePath);
    }

    connectedCallback() {
        super.connectedCallback();
        this._editor = ace.edit(this.$.editor);
        this._findCommand = this._editor.commands.commands.find;

        this._editor.setOption('minLines', 5);
        this._editor.$blockScrolling = Infinity;
        this._editor.on('change', () => {
            if (this._ignoreEditorChangeEvents) {
                return;
            }

            this._oldValue = this._editor.getValue();
            this.value = this._oldValue;
        });

        this._onModeChanged();
        this._onReadOnlyChanged();
        this._onUseWrapModeChanged();
        this._onMaxLinesChanged();
        this._onValueChanged();
        this._onThemeChanged();
    }

    disconnectedCallback() {
        this._editor.destroy();
        this._editor = undefined;
        this._oldValue = '';
        super.disconnectedCallback();
    }

    /**
     * If the value is updated while the ACE editor is not
     * visible on the screen (e.g. it's inside of a hidden
     * div), the editor is not redrawn once it gets visible.
     *
     * To fix this, elements should call this method as soon
     * as the editor gets visible again.
     */
    notifyVisibilityChanged() {
        if (!this._editor) {
            return;
        }

        this._editor.resize();
    }

    _onValueChanged() {
        if (!this._editor || this.value === this._oldValue) {
            return;
        }

        this._oldValue = this.value || '';
        this._ignoreEditorChangeEvents = true;
        this._editor.setValue(this._oldValue);
        this._ignoreEditorChangeEvents = false;
        this._editor.clearSelection();
        this._editor.scrollToLine(0);
    }

    _onModeChanged() {
        if (!this._editor) {
            return;
        }

        this._editor.session.setMode(this.mode);
    }

    _onReadOnlyChanged() {
        if (!this._editor) {
            return;
        }

        this._editor.setReadOnly(this.readOnly);
    }

    _onUseWrapModeChanged() {
        if (!this._editor) {
            return;
        }

        this._editor.session.setUseWrapMode(this.useWrapMode);
    }

    _onMaxLinesChanged() {
        if (!this._editor) {
            return;
        }

        this._editor.setOption('maxLines', this.maxLines);
    }

    _onDisableSearchChanged() {
        if (!this._editor) {
            return;
        }

        if (this.disableSearch) {
            if (this._editor.searchBox) {
                this._editor.searchBox.hide();
            }

            this._editor.commands.removeCommand('find');
        } else {
            this._editor.commands.addCommand(this._findCommand);
        }
    }

    _onThemeChanged() {
        if (!this._editor) {
            return;
        }

        if (this.theme === 'dark') {
            this._editor.setTheme('ace/theme/twilight');
            this.$.editor.style.removeProperty('background-color');
        } else {
            this._editor.setTheme('ace/theme/chrome');
            this.$.editor.style.backgroundColor = '#f5f5f5';
        }
    }
}

customElements.define(RESTerAceInput.is, RESTerAceInput);
