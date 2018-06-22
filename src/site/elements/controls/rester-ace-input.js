import { PolymerElement } from '../../../../node_modules/@polymer/polymer/polymer-element.js';
import { html } from '../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js';
import '../../../../node_modules/ace-builds/src-min-noconflict/ace.js';
import RESTerThemeMixin from '../data/rester-data-theme-mixin.js';

/**
 * @polymer
 * @mixinFunction
 */
const RESTerAceShadowDomMixin = (function () {
    const aceShadowRoots = [];
    const styles = getStyles();

    createDomHook();

    function createDomHook() {
        const domHook = ace.require('ace/lib/dom');
        const dom = {
            getDocumentHead: domHook.getDocumentHead,
            importCssString: domHook.importCssString,
            hasCssString: domHook.hasCssString
        };

        const docHook = {
            createElement: document.createElement.bind(document),
            createTextNode: document.createTextNode.bind(document),
            cssHead: null // change by importCssString
        };

        domHook.getDocumentHead = function (doc) {
            if (doc === docHook) {
                return docHook.cssHead;
            }

            return dom.getDocumentHead.apply(doc, arguments);
        };

        domHook.hasCssString = function (id, doc) {
            if (doc === docHook) {
                let index = 0,
                    sheets;
                doc = docHook.cssHead || document;
                if (doc.createStyleSheet && doc.styleSheets) {
                    sheets = doc.styleSheets;
                    while (index < sheets.length) {
                        if (sheets[index++].owningElement.id === id) {
                            return true;
                        }
                    }
                } else {
                    sheets = Polymer.dom(doc).querySelectorAll('style');
                    while (index < sheets.length) {
                        if (sheets[index++].id === id) {
                            return true;
                        }
                    }
                }

                return false;
            }

            return dom.hasCssString(id, doc);
        };

        domHook.importCssString = function (cssText, id) {
            let result;
            aceShadowRoots.forEach(cssHead => {
                docHook.cssHead = cssHead;
                result = dom.importCssString.call(this, cssText, id, docHook);
            });

            return result;
        };
    }

    function getStyles() {
        const style1 = document.getElementById('ace_editor.css') || document.getElementById('ace_editor') || document.querySelector('[id="ace_editor.css"]');
        const style2 = document.getElementById('ace-tm');
        const style3 = style2.nextSibling;

        return [style1, style2, style3];
    }

    return superclass => class AceShadowDomMixin extends superclass {
        ready() {
            super.ready();

            this._dom = Polymer.dom(this.root);

            styles.forEach(style => {
                this._dom.appendChild(style.cloneNode(true));
            });
        }

        connectedCallback() {
            super.connectedCallback();
            aceShadowRoots.push(this._dom);
        }

        disconnectedCallback() {
            const index = aceShadowRoots.indexOf(this._dom);
            aceShadowRoots.splice(index, 1);
            super.disconnectedCallback();
        }
    };
})();

/**
 * @appliesMixin RESTerThemeMixin
 * @appliesMixin RESTerAceShadowDomMixin
 * @polymer
 * @customElement
 */
class RESTerAceInput extends RESTerThemeMixin(RESTerAceShadowDomMixin(PolymerElement)) {
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
                observer: '_onValueChanged'
            },
            mode: {
                type: String,
                observer: '_onModeChanged'
            },
            readOnly: {
                type: Boolean,
                value: false,
                observer: '_onReadOnlyChanged'
            },
            useWrapMode: {
                type: Boolean,
                value: false,
                observer: '_onUseWrapModeChanged'
            },
            maxLines: {
                type: Number,
                value: 20,
                observer: '_onMaxLinesChanged'
            },
            disableSearch: {
                type: Boolean,
                value: false,
                observer: '_onDisableSearchChanged'
            }
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
        ace.config.set('basePath', this.resolveUrl('node_modules/ace-builds/src-min-noconflict/'));
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
