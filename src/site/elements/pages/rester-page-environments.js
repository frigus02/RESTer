import { PolymerElement } from '../../../../node_modules/@polymer/polymer/polymer-element.js';
import { html } from '../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js';
import '../../../../node_modules/@polymer/app-layout/app-header-layout/app-header-layout.js';
import '../../../../node_modules/@polymer/app-layout/app-header/app-header.js';
import '../../../../node_modules/@polymer/app-layout/app-toolbar/app-toolbar.js';
import '../../../../node_modules/@polymer/paper-fab/paper-fab.js';
import '../../../../node_modules/@polymer/paper-icon-button/paper-icon-button.js';
import '../../../../node_modules/@polymer/paper-radio-button/paper-radio-button.js';
import '../../../../node_modules/@polymer/paper-radio-group/paper-radio-group.js';
import '../styles/rester-icons.js';
import resterPageStyle from '../styles/rester-page.js';
import dialogs from '../data/scripts/dialogs.js';
import { truncate } from '../data/scripts/encode.js';
import {
    getEnvironments,
    putEnvironment,
    deleteEnvironment,
} from '../data/scripts/rester.js';
import { cloneDeep } from '../../../shared/util.js';
import RESTerPageMixin from '../layout/rester-page-mixin.js';
import RESTerSettingsMixin from '../data/rester-data-settings-mixin.js';

/**
 * @appliesMixin RESTerPageMixin
 * @appliesMixin RESTerSettingsMixin
 * @polymer
 * @customElement
 */
class RESTerPageEnvironments extends RESTerPageMixin(
    RESTerSettingsMixin(PolymerElement)
) {
    static get template() {
        return html`
            ${resterPageStyle}

            <style>
                :host {
                    display: block;
                }

                paper-radio-group {
                    display: flex;
                    flex-wrap: wrap;
                    --paper-radio-group-item-padding: 8px;
                }

                paper-radio-button {
                    box-sizing: border-box;
                    width: calc(100% - 40px);
                }

                paper-radio-button div {
                    font-size: 14px;
                }

                paper-radio-button div[secondary] {
                    font-size: 12px;
                    word-break: break-all;
                }

                paper-fab {
                    position: fixed;
                    right: 24px;
                    bottom: 24px;
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
                    <p>
                        Environments can be used to store a list of values,
                        which are available as variables in requests by using
                        the placeholder <code>{$env.&lt;name&gt;}</code>.
                        Example: <code>{$env.hostname}</code> if the active
                        environment contains a value with the key
                        <em>hostname</em>.
                    </p>

                    <paper-radio-group
                        selected="{{settings.activeEnvironment}}"
                    >
                        <template
                            is="dom-repeat"
                            items="[[environments]]"
                            as="env"
                            sort="_compareEnvironments"
                        >
                            <paper-radio-button name="[[env.id]]">
                                <div>[[env.name]]</div>
                                <template
                                    is="dom-repeat"
                                    items="[[_computeValueItems(env)]]"
                                >
                                    <div secondary>
                                        [[item.key]]: [[item.value]]
                                    </div>
                                </template>
                            </paper-radio-button>
                            <paper-icon-button
                                icon="edit"
                                on-tap="_editEnvironment"
                            ></paper-icon-button>
                        </template>
                    </paper-radio-group>

                    <paper-fab icon="add" on-tap="_addEnvironment"></paper-fab>
                </div>
            </app-header-layout>
        `;
    }

    static get is() {
        return 'rester-page-environments';
    }

    static get properties() {
        return {
            environments: {
                type: Array,
                readOnly: true,
            },
        };
    }

    constructor() {
        super();
        this._environmentInDialog = undefined;
        this._environmentInDialogIndex = -1;
    }

    ready() {
        super.ready();
        this._setPageTitle('Environments');
        getEnvironments().then((envs) => {
            this._setEnvironments(envs);
        });
    }

    _addEnvironment() {
        this._environmentInDialog = {
            name: '',
            values: {},
        };
        this._environmentInDialogIndex = -1;
        this._showEditDialog();
    }

    _editEnvironment(e) {
        this._environmentInDialog = cloneDeep(e.model.env);
        this._environmentInDialogIndex = this.environments.indexOf(e.model.env);
        this._showEditDialog();
    }

    _showEditDialog() {
        dialogs.editEnvironment
            .show(this._environmentInDialog)
            .then((result) => this._onEditDialogClosed(result));
    }

    _onEditDialogClosed(result) {
        if (result.reason.confirmed && result.reason.action === 'save') {
            putEnvironment(this._environmentInDialog).then((id) => {
                this._environmentInDialog.id = id;

                if (this._environmentInDialogIndex > -1) {
                    this.splice(
                        'environments',
                        this._environmentInDialogIndex,
                        1,
                        this._environmentInDialog
                    );
                } else {
                    this.push('environments', this._environmentInDialog);
                }
            });
        } else if (
            result.reason.confirmed &&
            result.reason.action === 'delete'
        ) {
            deleteEnvironment(this._environmentInDialog.id).then(() => {
                this.splice('environments', this._environmentInDialogIndex, 1);
            });
        }
    }

    _compareEnvironments(a, b) {
        return a.name.localeCompare(b.name);
    }

    _computeValueItems(env) {
        return Object.keys(env.values).map((key) => ({
            key,
            value: truncate(env.values[key], 120),
        }));
    }
}

customElements.define(RESTerPageEnvironments.is, RESTerPageEnvironments);
