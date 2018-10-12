import { PolymerElement } from '../../../node_modules/@polymer/polymer/polymer-element.js';
import { html } from '../../../node_modules/@polymer/polymer/lib/utils/html-tag.js';
import { setPassiveTouchGestures } from '../../../node_modules/@polymer/polymer/lib/utils/settings.js';
import '../../../node_modules/@polymer/app-layout/app-drawer-layout/app-drawer-layout.js';
import '../../../node_modules/@polymer/app-layout/app-drawer/app-drawer.js';
import '../../../node_modules/@polymer/app-layout/app-header-layout/app-header-layout.js';
import '../../../node_modules/@polymer/app-layout/app-header/app-header.js';
import '../../../node_modules/@polymer/app-layout/app-toolbar/app-toolbar.js';
import '../../../node_modules/@polymer/app-route/app-location.js';
import '../../../node_modules/@polymer/app-route/app-route.js';
import '../../../node_modules/@polymer/iron-media-query/iron-media-query.js';
import '../../../node_modules/@polymer/paper-icon-button/paper-icon-button.js';
import '../../../node_modules/@polymer/paper-styles/paper-styles.js';
import './controls/rester-edit-environment-dialog.js';
import './layout/rester-drawer-footer-links.js';
import './layout/rester-navigation-list.js';
import './layout/rester-notifications.js';
import './layout/rester-pages.js';
import './styles/rester-icons.js';
import './utils/rester-authorization-provider-basic-generate-token-dialog.js';
import './utils/rester-authorization-provider-cookie-configuration-dialog.js';
import './utils/rester-authorization-provider-custom-generate-token-dialog.js';
import './utils/rester-authorization-provider-oauth2-configuration-dialog.js';
import './utils/rester-authorization-provider-oauth2-generate-token-resource-owner-dialog.js';
import './utils/rester-environment-select-dialog.js';
import './utils/rester-error.js';
import './utils/rester-export-dialog.js';
import './utils/rester-highlight-language-select-dialog.js';
import './utils/rester-hotkeys-cheat-sheet.js';
import './utils/rester-import-dialog.js';
import './utils/rester-cleanup-history-dialog.js';
import './utils/rester-quick-open-dialog.js';
import './utils/rester-timing-duration-dialog.js';
import './utils/rester-timing-size-dialog.js';
import dialogs from './data/scripts/dialogs.js';
import { getEnvironments } from './data/scripts/rester.js';
import RESTerThemeMixin from './data/rester-data-theme-mixin.js';
import RESTerHotkeysMixin from './data/rester-data-hotkeys-mixin.js';
import RESTerSettingsMixin from './data/rester-data-settings-mixin.js';

setPassiveTouchGestures(true);

/**
 * @appliesMixin RESTerThemeMixin
 * @appliesMixin RESTerSettingsMixin
 * @appliesMixin RESTerHotkeysMixin
 * @polymer
 * @customElement
 */
class RESTerApp extends RESTerThemeMixin(
    RESTerSettingsMixin(RESTerHotkeysMixin(PolymerElement))
) {
    static get template() {
        return html`
            <style>
                :host {
                    --primary-text-color: var(--dark-theme-text-color);
                    --primary-background-color: var(--dark-theme-background-color);
                    --secondary-text-color: var(--dark-theme-secondary-color);
                    --disabled-text-color: var(--dark-theme-disabled-color);
                    --divider-color: var(--dark-theme-divider-color);
                    --error-color: var(--paper-deep-orange-a700);

                    --primary-color: var(--paper-cyan-500);
                    --light-primary-color: var(--paper-cyan-100);
                    --dark-primary-color: var(--paper-cyan-700);

                    --accent-color: var(--paper-amber-a200);
                    --light-accent-color: var(--paper-amber-a100);
                    --dark-accent-color: var(--paper-amber-a400);

                    --app-drawer-width: 320px;
                    --app-drawer-content-container: {
                        background-color: var(--primary-background-color);
                        border-right: 1px solid var(--divider-color);
                    };

                    display: block;
                    background-color: var(--primary-background-color);
                    color: var(--primary-text-color);
                    @apply --paper-font-common-base;
                }

                :host([theme="light"]) {
                    --primary-text-color: var(--light-theme-text-color);
                    --primary-background-color: var(--light-theme-background-color);
                    --secondary-text-color: var(--light-theme-secondary-color);
                    --disabled-text-color: var(--light-theme-disabled-color);
                    --divider-color: var(--light-theme-divider-color);
                }

                app-drawer app-toolbar {
                    border-bottom: 1px solid var(--divider-color);

                    /* Make the notification icon aligned to the other icons from the navigation. */
                    padding-right: 8px;
                }

                .navigation {
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    position: absolute;
                    top: 0;
                    right: 0;
                    bottom: 0;
                    left: 0;
                }

                rester-pages {
                    min-height: 100vh;
                }
            </style>

            <app-location route="{{route}}" use-hash-as-path></app-location>
            <app-route
                    route="[[route]]"
                    pattern="/:page"
                    data="{{routeData}}"
                    tail="{{routeTail}}"></app-route>

            <app-drawer-layout
                    responsive-width="[[responsiveWidth]]"
                    narrow="{{drawerIsNarrow}}">
                <!-- Navigation -->
                <app-drawer slot="drawer" id="drawer">
                    <app-header-layout has-scrolling-region>
                        <app-header slot="header" fixed>
                            <app-toolbar>
                                <div main-title>RESTer</div>
                                <iron-media-query
                                        query="[[showDrawerLockMediaQuery]]"
                                        query-matches="{{showDrawerLock}}"></iron-media-query>
                                <paper-icon-button
                                        icon="[[_getDrawerToggleIcon(settings.pinSidenav)]]"
                                        on-tap="_toggleDrawerLockOpen"
                                        hidden$="[[!showDrawerLock]]"></paper-icon-button>
                                <rester-notifications></rester-notifications>
                            </app-toolbar>
                        </app-header>
                        <div class="navigation">
                            <rester-navigation-list
                                    route="[[route]]"
                                    on-item-activated="_onNavigationItemActivated"></rester-navigation-list>
                            <rester-drawer-footer-links>
                                <a href="#" on-tap="_showShortcuts">Shortcuts</a> &dash;
                                <a href="#/about">About</a>
                            </rester-drawer-footer-links>
                        </div>
                    </app-header-layout>
                </app-drawer>

                <!-- Main -->
                <rester-pages
                        page="[[page]]"
                        page-title="{{pageTitle}}"
                        route="[[routeTail]]"
                        show-drawer-toggle="[[drawerIsNarrow]]"
                        on-drawer-toggle-tapped="_onDrawerToggleTapped"></rester-pages>
            </app-drawer-layout>

            <rester-error></rester-error>
            <rester-hotkeys-cheat-sheet id="cheatSheet"></rester-hotkeys-cheat-sheet>
            <rester-quick-open-dialog id="quickOpenDialog"></rester-quick-open-dialog>

            <!--
                All dialogs need to be outside of the app-drawe-layout.
                See: https://github.com/PolymerElements/paper-dialog/issues/152
            -->
            <rester-authorization-provider-basic-generate-token-dialog></rester-authorization-provider-basic-generate-token-dialog>
            <rester-authorization-provider-cookie-configuration-dialog></rester-authorization-provider-cookie-configuration-dialog>
            <rester-authorization-provider-custom-generate-token-dialog></rester-authorization-provider-custom-generate-token-dialog>
            <rester-authorization-provider-oauth2-configuration-dialog></rester-authorization-provider-oauth2-configuration-dialog>
            <rester-authorization-provider-oauth2-generate-token-resource-owner-dialog></rester-authorization-provider-oauth2-generate-token-resource-owner-dialog>
            <rester-edit-environment-dialog></rester-edit-environment-dialog>
            <rester-environment-select-dialog></rester-environment-select-dialog>
            <rester-export-dialog></rester-export-dialog>
            <rester-highlight-language-select-dialog></rester-highlight-language-select-dialog>
            <rester-import-dialog></rester-import-dialog>
            <rester-cleanup-history-dialog></rester-cleanup-history-dialog>
            <rester-timing-duration-dialog></rester-timing-duration-dialog>
            <rester-timing-size-dialog></rester-timing-size-dialog>
        `;
    }

    static get is() {
        return 'rester-app';
    }

    static get properties() {
        return {
            route: Object,
            routeData: Object,
            routeTail: Object,
            page: String,
            pageTitle: {
                type: String,
                observer: '_onPageTitleChanged'
            },
            responsiveWidth: {
                type: String,
                computed: '_computeResponsiveWidth(settings.pinSidenav)'
            },
            responsiveWidthMin: {
                type: String,
                value: '600px'
            },
            responsiveWidthMax: {
                type: String,
                value: '1279px'
            },
            showDrawerLockMediaQuery: {
                type: String,
                computed:
                    '_computeShowDrawerLockMediaQuery(responsiveWidthMin, responsiveWidthMax)'
            }
        };
    }

    static get observers() {
        return ['_routePageChanged(routeData.page)'];
    }

    static get resterHotkeys() {
        return {
            'mod+m': {
                description: 'New request.',
                callback: '_newRequest'
            },
            'mod+o, mod+p': {
                description: 'Open request.',
                callback: '_showQuickOpenDialog'
            },
            'mod+e': {
                description: 'Cycle through environments.',
                callback: '_activateNextEnvironment'
            },
            'mod+shift+e': {
                description: 'Open environment selection dialog.',
                callback: '_showEnvironmentSelectDialog'
            }
        };
    }

    _routePageChanged(page) {
        this.page = page || 'request';
    }

    _onPageTitleChanged() {
        document.title = `RESTer - ${this.pageTitle}`;
    }

    _computeResponsiveWidth(pinSidenav) {
        return pinSidenav ? this.responsiveWidthMin : this.responsiveWidthMax;
    }

    _computeShowDrawerLockMediaQuery(responsiveWidthMin, responsiveWidthMax) {
        return `(min-width: ${responsiveWidthMin}) and (max-width: ${responsiveWidthMax})`;
    }

    _getDrawerToggleIcon() {
        return this.settings.pinSidenav ? 'lock-outline' : 'lock-open';
    }

    _toggleDrawerLockOpen() {
        this.set('settings.pinSidenav', !this.settings.pinSidenav);
    }

    _onDrawerToggleTapped() {
        this.$.drawer.toggle();
    }

    _onNavigationItemActivated() {
        if (this.drawerIsNarrow) {
            this.$.drawer.close();
        }
    }

    _onThemeChanged(theme) {
        // index.html will pick up the theme from localStorage
        // to show the splash screen in the correct colors.
        window.localStorage.theme = theme;
    }

    _showShortcuts(e) {
        e.preventDefault();
        this.$.cheatSheet.show();
    }

    _newRequest() {
        window.location = '#/';
    }

    _showQuickOpenDialog() {
        this.$.quickOpenDialog.show();
    }

    _activateNextEnvironment() {
        getEnvironments().then(envs => {
            if (envs.length === 0) {
                return;
            }

            const index = envs.findIndex(
                env => env.id === this.settings.activeEnvironment
            );
            const newIndex = (index + 1) % envs.length;
            const newEnv = envs[newIndex];

            this.settings.activeEnvironment = newEnv.id;
        });
    }

    _showEnvironmentSelectDialog() {
        dialogs.environmentSelect.show();
    }
}

customElements.define(RESTerApp.is, RESTerApp);
