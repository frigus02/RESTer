import { PolymerElement } from '../../../../node_modules/@polymer/polymer/polymer-element.js';
import { html } from '../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js';
import '../../../../node_modules/@polymer/app-layout/app-header-layout/app-header-layout.js';
import '../../../../node_modules/@polymer/app-layout/app-header/app-header.js';
import '../../../../node_modules/@polymer/app-layout/app-toolbar/app-toolbar.js';
import '../../../../node_modules/@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
import '../../../../node_modules/@polymer/paper-icon-button/paper-icon-button.js';
import '../../../../node_modules/@polymer/paper-item/paper-item.js';
import '../../../../node_modules/@polymer/paper-listbox/paper-listbox.js';
import '../../../../node_modules/@polymer/paper-toggle-button/paper-toggle-button.js';
import resterHintStyle from '../styles/rester-hint.js';
import '../styles/rester-icons.js';
import resterPageStyle from '../styles/rester-page.js';
import RESTerPageMixin from '../layout/rester-page-mixin.js';
import RESTerSettingsMixin from '../data/rester-data-settings-mixin.js';

/**
 * @appliesMixin RESTerPageMixin
 * @appliesMixin RESTerSettingsMixin
 * @polymer
 * @customElement
 */
class RESTerPageSettings extends RESTerPageMixin(
    RESTerSettingsMixin(PolymerElement)
) {
    static get template() {
        return html`
            ${resterHintStyle} ${resterPageStyle}

            <style>
                :host {
                    display: block;
                }

                .setting {
                    margin-bottom: 32px;
                }

                paper-toggle-button {
                    margin: 16px 0;
                }

                dd {
                    margin-bottom: 12px;
                }

                paper-button {
                    background-color: var(--primary-color);
                    margin: 0 16px 16px 0;
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
                    <div class="setting">
                        <paper-dropdown-menu label="Theme">
                            <paper-listbox
                                slot="dropdown-content"
                                selected="{{settings.theme}}"
                                attr-for-selected="value"
                            >
                                <paper-item value="dark">Dark</paper-item>
                                <paper-item value="light">Light</paper-item>
                            </paper-listbox>
                        </paper-dropdown-menu>
                    </div>

                    <div class="setting">
                        <paper-dropdown-menu label="Request Mode">
                            <paper-listbox
                                slot="dropdown-content"
                                selected="{{requestMode}}"
                                attr-for-selected="value"
                            >
                                <paper-item value="browser"
                                    >Browser Requests</paper-item
                                >
                                <paper-item value="clean"
                                    >Clean Requests</paper-item
                                >
                            </paper-listbox>
                        </paper-dropdown-menu>
                        <div class="hint">
                            <dl>
                                <dt>Browser Requests</dt>
                                <dd>
                                    Send requests just as the browser would
                                    normally do. This will include all default
                                    headers like <code>User-Agent</code> and
                                    also <code>Cookie</code>. You can still
                                    override these defaults by explicitly
                                    specifying the header.
                                </dd>
                                <dt>Clean Requests</dt>
                                <dd>
                                    Send requests exactly as you define them in
                                    RESTer. This will not send any of the
                                    default headers except for the ones required
                                    by the browser like <code>Host</code>.
                                </dd>
                            </dl>
                        </div>
                    </div>

                    <div class="setting">
                        <paper-toggle-button
                            checked="{{settings.enableRequestLintInspections}}"
                        >
                            Inspections for requests
                        </paper-toggle-button>
                        <div class="hint">
                            RESTer can analyze your request as you type and
                            point out possible mistakes. Currently this
                            includes:
                            <ul>
                                <li>Using a variable with an empty value.</li>
                                <li>
                                    Using files in a form body without
                                    <code>multipart/form-data</code> content
                                    type.
                                </li>
                                <li>
                                    Using an empty file input in a form body.
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div class="setting">
                        <paper-toggle-button
                            checked="{{settings.showVariablesOnSide}}"
                        >
                            Show variables on right side
                        </paper-toggle-button>
                        <div class="hint">
                            By default variables are shown in a tab. When
                            enabling this option and the browser is wide enough,
                            variables will be shown on the right side of the
                            request instead.
                        </div>
                    </div>

                    <div class="setting">
                        <paper-toggle-button
                            checked="{{settings.requestPageFullWidth}}"
                        >
                            Expand request page to full width
                        </paper-toggle-button>
                    </div>
                </div>
            </app-header-layout>
        `;
    }

    static get is() {
        return 'rester-page-settings';
    }

    static get properties() {
        return {
            requestMode: {
                type: String,
                observer: '_onRequestModeChanged'
            }
        };
    }

    static get observers() {
        return [
            '_onSettingsStripDefaultHeadersChanged(settings.stripDefaultHeaders)'
        ];
    }

    ready() {
        super.ready();
        this._setPageTitle('Settings');
    }

    _onRequestModeChanged() {
        this.settings.stripDefaultHeaders = this.requestMode === 'clean';
    }

    _onSettingsStripDefaultHeadersChanged(stripDefaultHeaders) {
        this.requestMode = stripDefaultHeaders ? 'clean' : 'browser';
    }
}

customElements.define(RESTerPageSettings.is, RESTerPageSettings);
