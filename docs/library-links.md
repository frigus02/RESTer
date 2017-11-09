# Libary links

As stated in the post [Improving Review Time by Providing Links to Third Party Sources](https://blog.mozilla.org/addons/2016/04/05/improved-review-time-with-links-to-sources/) it is useful for the addon reviewers to have links to the sources of third party libraries, which are used in the addon.

Update this file with all changes to used third party libraries (add/remove dependency, change version). Use the following helper:

    npm run updatelibrarylinks

```
DOMPurify 1.0.2
https://github.com/cure53/DOMPurify/blob/1.0.2/dist/purify.min.js

ace-builds v1.2.9
https://github.com/ajaxorg/ace-builds/blob/v1.2.9/src-min-noconflict/ace.js
https://github.com/ajaxorg/ace-builds/blob/v1.2.9/src-min-noconflict/ext-searchbox.js
https://github.com/ajaxorg/ace-builds/blob/v1.2.9/src-min-noconflict/mode-html.js
https://github.com/ajaxorg/ace-builds/blob/v1.2.9/src-min-noconflict/mode-json.js
https://github.com/ajaxorg/ace-builds/blob/v1.2.9/src-min-noconflict/mode-text.js
https://github.com/ajaxorg/ace-builds/blob/v1.2.9/src-min-noconflict/mode-xml.js
https://github.com/ajaxorg/ace-builds/blob/v1.2.9/src-min-noconflict/theme-chrome.js
https://github.com/ajaxorg/ace-builds/blob/v1.2.9/src-min-noconflict/theme-twilight.js
https://github.com/ajaxorg/ace-builds/blob/v1.2.9/src-min-noconflict/worker-html.js
https://github.com/ajaxorg/ace-builds/blob/v1.2.9/src-min-noconflict/worker-json.js
https://github.com/ajaxorg/ace-builds/blob/v1.2.9/src-min-noconflict/worker-xml.js

app-layout v2.0.4
https://github.com/PolymerElements/app-layout/blob/v2.0.4/app-drawer-layout/app-drawer-layout.html
https://github.com/PolymerElements/app-layout/blob/v2.0.4/app-drawer/app-drawer.html
https://github.com/PolymerElements/app-layout/blob/v2.0.4/app-header-layout/app-header-layout.html
https://github.com/PolymerElements/app-layout/blob/v2.0.4/app-header/app-header.html
https://github.com/PolymerElements/app-layout/blob/v2.0.4/app-layout-behavior/app-layout-behavior.html
https://github.com/PolymerElements/app-layout/blob/v2.0.4/app-scroll-effects/app-scroll-effects-behavior.html
https://github.com/PolymerElements/app-layout/blob/v2.0.4/app-toolbar/app-toolbar.html
https://github.com/PolymerElements/app-layout/blob/v2.0.4/helpers/helpers.html

app-route v2.0.3
https://github.com/PolymerElements/app-route/blob/v2.0.3/app-location.html
https://github.com/PolymerElements/app-route/blob/v2.0.3/app-route-converter-behavior.html
https://github.com/PolymerElements/app-route/blob/v2.0.3/app-route.html

font-roboto v1.0.1
https://github.com/PolymerElements/font-roboto-local/blob/v1.0.1/fonts/roboto/Roboto-Black.ttf
https://github.com/PolymerElements/font-roboto-local/blob/v1.0.1/fonts/roboto/Roboto-BlackItalic.ttf
https://github.com/PolymerElements/font-roboto-local/blob/v1.0.1/fonts/roboto/Roboto-Bold.ttf
https://github.com/PolymerElements/font-roboto-local/blob/v1.0.1/fonts/roboto/Roboto-BoldItalic.ttf
https://github.com/PolymerElements/font-roboto-local/blob/v1.0.1/fonts/roboto/Roboto-Italic.ttf
https://github.com/PolymerElements/font-roboto-local/blob/v1.0.1/fonts/roboto/Roboto-Light.ttf
https://github.com/PolymerElements/font-roboto-local/blob/v1.0.1/fonts/roboto/Roboto-LightItalic.ttf
https://github.com/PolymerElements/font-roboto-local/blob/v1.0.1/fonts/roboto/Roboto-Medium.ttf
https://github.com/PolymerElements/font-roboto-local/blob/v1.0.1/fonts/roboto/Roboto-MediumItalic.ttf
https://github.com/PolymerElements/font-roboto-local/blob/v1.0.1/fonts/roboto/Roboto-Regular.ttf
https://github.com/PolymerElements/font-roboto-local/blob/v1.0.1/fonts/roboto/Roboto-Thin.ttf
https://github.com/PolymerElements/font-roboto-local/blob/v1.0.1/fonts/roboto/Roboto-ThinItalic.ttf
https://github.com/PolymerElements/font-roboto-local/blob/v1.0.1/fonts/robotomono/RobotoMono-Bold.ttf
https://github.com/PolymerElements/font-roboto-local/blob/v1.0.1/fonts/robotomono/RobotoMono-BoldItalic.ttf
https://github.com/PolymerElements/font-roboto-local/blob/v1.0.1/fonts/robotomono/RobotoMono-Italic.ttf
https://github.com/PolymerElements/font-roboto-local/blob/v1.0.1/fonts/robotomono/RobotoMono-Light.ttf
https://github.com/PolymerElements/font-roboto-local/blob/v1.0.1/fonts/robotomono/RobotoMono-LightItalic.ttf
https://github.com/PolymerElements/font-roboto-local/blob/v1.0.1/fonts/robotomono/RobotoMono-Medium.ttf
https://github.com/PolymerElements/font-roboto-local/blob/v1.0.1/fonts/robotomono/RobotoMono-MediumItalic.ttf
https://github.com/PolymerElements/font-roboto-local/blob/v1.0.1/fonts/robotomono/RobotoMono-Regular.ttf
https://github.com/PolymerElements/font-roboto-local/blob/v1.0.1/fonts/robotomono/RobotoMono-Thin.ttf
https://github.com/PolymerElements/font-roboto-local/blob/v1.0.1/fonts/robotomono/RobotoMono-ThinItalic.ttf
https://github.com/PolymerElements/font-roboto-local/blob/v1.0.1/roboto.html

iron-a11y-announcer v2.0.0
https://github.com/PolymerElements/iron-a11y-announcer/blob/v2.0.0/iron-a11y-announcer.html

iron-a11y-keys-behavior v2.0.1
https://github.com/PolymerElements/iron-a11y-keys-behavior/blob/v2.0.1/iron-a11y-keys-behavior.html

iron-a11y-keys v2.0.0
https://github.com/PolymerElements/iron-a11y-keys/blob/v2.0.0/iron-a11y-keys.html

iron-ajax v2.0.5
https://github.com/PolymerElements/iron-ajax/blob/v2.0.5/iron-ajax.html
https://github.com/PolymerElements/iron-ajax/blob/v2.0.5/iron-request.html

iron-autogrow-textarea v2.1.0
https://github.com/PolymerElements/iron-autogrow-textarea/blob/v2.1.0/iron-autogrow-textarea.html

iron-behaviors v2.0.0
https://github.com/PolymerElements/iron-behaviors/blob/v2.0.0/iron-button-state.html
https://github.com/PolymerElements/iron-behaviors/blob/v2.0.0/iron-control-state.html

iron-checked-element-behavior v2.0.0
https://github.com/PolymerElements/iron-checked-element-behavior/blob/v2.0.0/iron-checked-element-behavior.html

iron-collapse v2.0.0
https://github.com/PolymerElements/iron-collapse/blob/v2.0.0/iron-collapse.html

iron-dropdown v2.1.0
https://github.com/PolymerElements/iron-dropdown/blob/v2.1.0/iron-dropdown-scroll-manager.html
https://github.com/PolymerElements/iron-dropdown/blob/v2.1.0/iron-dropdown.html

iron-fit-behavior v2.1.0
https://github.com/PolymerElements/iron-fit-behavior/blob/v2.1.0/iron-fit-behavior.html

iron-flex-layout v2.0.1
https://github.com/PolymerElements/iron-flex-layout/blob/v2.0.1/iron-flex-layout-classes.html
https://github.com/PolymerElements/iron-flex-layout/blob/v2.0.1/iron-flex-layout.html

iron-form-element-behavior v2.0.0
https://github.com/PolymerElements/iron-form-element-behavior/blob/v2.0.0/iron-form-element-behavior.html

iron-form undefined
https://github.com/PolymerElements/iron-form/blob/undefined/iron-form.html

iron-icon v2.0.1
https://github.com/PolymerElements/iron-icon/blob/v2.0.1/iron-icon.html

iron-iconset-svg v2.1.0
https://github.com/PolymerElements/iron-iconset-svg/blob/v2.1.0/iron-iconset-svg.html

iron-input v2.0.1
https://github.com/PolymerElements/iron-input/blob/v2.0.1/iron-input.html

iron-location v2.0.2
https://github.com/PolymerElements/iron-location/blob/v2.0.2/iron-location.html
https://github.com/PolymerElements/iron-location/blob/v2.0.2/iron-query-params.html

iron-media-query v2.0.0
https://github.com/PolymerElements/iron-media-query/blob/v2.0.0/iron-media-query.html

iron-menu-behavior v2.0.1
https://github.com/PolymerElements/iron-menu-behavior/blob/v2.0.1/iron-menu-behavior.html
https://github.com/PolymerElements/iron-menu-behavior/blob/v2.0.1/iron-menubar-behavior.html

iron-meta v2.0.3
https://github.com/PolymerElements/iron-meta/blob/v2.0.3/iron-meta.html

iron-overlay-behavior v2.2.0
https://github.com/PolymerElements/iron-overlay-behavior/blob/v2.2.0/iron-focusables-helper.html
https://github.com/PolymerElements/iron-overlay-behavior/blob/v2.2.0/iron-overlay-backdrop.html
https://github.com/PolymerElements/iron-overlay-behavior/blob/v2.2.0/iron-overlay-behavior.html
https://github.com/PolymerElements/iron-overlay-behavior/blob/v2.2.0/iron-overlay-manager.html
https://github.com/PolymerElements/iron-overlay-behavior/blob/v2.2.0/iron-scroll-manager.html

iron-pages v2.0.0
https://github.com/PolymerElements/iron-pages/blob/v2.0.0/iron-pages.html

iron-range-behavior v2.0.0
https://github.com/PolymerElements/iron-range-behavior/blob/v2.0.0/iron-range-behavior.html

iron-resizable-behavior v2.0.1
https://github.com/PolymerElements/iron-resizable-behavior/blob/v2.0.1/iron-resizable-behavior.html

iron-scroll-target-behavior v2.0.0
https://github.com/PolymerElements/iron-scroll-target-behavior/blob/v2.0.0/iron-scroll-target-behavior.html

iron-selector v2.0.0
https://github.com/PolymerElements/iron-selector/blob/v2.0.0/iron-multi-selectable.html
https://github.com/PolymerElements/iron-selector/blob/v2.0.0/iron-selectable.html
https://github.com/PolymerElements/iron-selector/blob/v2.0.0/iron-selection.html
https://github.com/PolymerElements/iron-selector/blob/v2.0.0/iron-selector.html

iron-validatable-behavior v2.0.0
https://github.com/PolymerElements/iron-validatable-behavior/blob/v2.0.0/iron-validatable-behavior.html

mousetrap 1.6.1
https://github.com/ccampbell/mousetrap/blob/1.6.1/mousetrap.min.js

neon-animation v2.0.2
https://github.com/PolymerElements/neon-animation/blob/v2.0.2/animations/fade-in-animation.html
https://github.com/PolymerElements/neon-animation/blob/v2.0.2/animations/fade-out-animation.html
https://github.com/PolymerElements/neon-animation/blob/v2.0.2/animations/scale-up-animation.html
https://github.com/PolymerElements/neon-animation/blob/v2.0.2/neon-animatable-behavior.html
https://github.com/PolymerElements/neon-animation/blob/v2.0.2/neon-animation-behavior.html
https://github.com/PolymerElements/neon-animation/blob/v2.0.2/neon-animation-runner-behavior.html
https://github.com/PolymerElements/neon-animation/blob/v2.0.2/web-animations.html

paper-badge v2.0.0
https://github.com/PolymerElements/paper-badge/blob/v2.0.0/paper-badge.html

paper-behaviors v2.0.1
https://github.com/PolymerElements/paper-behaviors/blob/v2.0.1/paper-button-behavior.html
https://github.com/PolymerElements/paper-behaviors/blob/v2.0.1/paper-checked-element-behavior.html
https://github.com/PolymerElements/paper-behaviors/blob/v2.0.1/paper-inky-focus-behavior.html
https://github.com/PolymerElements/paper-behaviors/blob/v2.0.1/paper-ripple-behavior.html

paper-button v2.0.0
https://github.com/PolymerElements/paper-button/blob/v2.0.0/paper-button.html

paper-checkbox v2.0.1
https://github.com/PolymerElements/paper-checkbox/blob/v2.0.1/paper-checkbox.html

paper-dialog-behavior v2.0.1
https://github.com/PolymerElements/paper-dialog-behavior/blob/v2.0.1/paper-dialog-behavior.html
https://github.com/PolymerElements/paper-dialog-behavior/blob/v2.0.1/paper-dialog-shared-styles.html

paper-dialog-scrollable v2.1.0
https://github.com/PolymerElements/paper-dialog-scrollable/blob/v2.1.0/paper-dialog-scrollable.html

paper-dialog v2.0.0
https://github.com/PolymerElements/paper-dialog/blob/v2.0.0/paper-dialog.html

paper-dropdown-menu v2.0.0
https://github.com/PolymerElements/paper-dropdown-menu/blob/v2.0.0/paper-dropdown-menu-icons.html
https://github.com/PolymerElements/paper-dropdown-menu/blob/v2.0.0/paper-dropdown-menu-shared-styles.html
https://github.com/PolymerElements/paper-dropdown-menu/blob/v2.0.0/paper-dropdown-menu.html

paper-fab v2.0.0
https://github.com/PolymerElements/paper-fab/blob/v2.0.0/paper-fab.html

paper-icon-button v2.0.1
https://github.com/PolymerElements/paper-icon-button/blob/v2.0.1/paper-icon-button.html

paper-input v2.0.3
https://github.com/PolymerElements/paper-input/blob/v2.0.3/paper-input-addon-behavior.html
https://github.com/PolymerElements/paper-input/blob/v2.0.3/paper-input-behavior.html
https://github.com/PolymerElements/paper-input/blob/v2.0.3/paper-input-char-counter.html
https://github.com/PolymerElements/paper-input/blob/v2.0.3/paper-input-container.html
https://github.com/PolymerElements/paper-input/blob/v2.0.3/paper-input-error.html
https://github.com/PolymerElements/paper-input/blob/v2.0.3/paper-input.html
https://github.com/PolymerElements/paper-input/blob/v2.0.3/paper-textarea.html

paper-item v2.0.0
https://github.com/PolymerElements/paper-item/blob/v2.0.0/paper-icon-item.html
https://github.com/PolymerElements/paper-item/blob/v2.0.0/paper-item-behavior.html
https://github.com/PolymerElements/paper-item/blob/v2.0.0/paper-item-body.html
https://github.com/PolymerElements/paper-item/blob/v2.0.0/paper-item-shared-styles.html
https://github.com/PolymerElements/paper-item/blob/v2.0.0/paper-item.html

paper-listbox v2.0.0
https://github.com/PolymerElements/paper-listbox/blob/v2.0.0/paper-listbox.html

paper-menu-button v2.0.0
https://github.com/PolymerElements/paper-menu-button/blob/v2.0.0/paper-menu-button-animations.html
https://github.com/PolymerElements/paper-menu-button/blob/v2.0.0/paper-menu-button.html

paper-progress v2.0.1
https://github.com/PolymerElements/paper-progress/blob/v2.0.1/paper-progress.html

paper-radio-button v2.0.0
https://github.com/PolymerElements/paper-radio-button/blob/v2.0.0/paper-radio-button.html

paper-radio-group v2.0.0
https://github.com/PolymerElements/paper-radio-group/blob/v2.0.0/paper-radio-group.html

paper-ripple v2.0.1
https://github.com/PolymerElements/paper-ripple/blob/v2.0.1/paper-ripple.html

paper-slider v2.0.3
https://github.com/PolymerElements/paper-slider/blob/v2.0.3/paper-slider.html

paper-spinner v2.0.0
https://github.com/PolymerElements/paper-spinner/blob/v2.0.0/paper-spinner-behavior.html
https://github.com/PolymerElements/paper-spinner/blob/v2.0.0/paper-spinner-styles.html
https://github.com/PolymerElements/paper-spinner/blob/v2.0.0/paper-spinner.html

paper-styles v2.0.0
https://github.com/PolymerElements/paper-styles/blob/v2.0.0/color.html
https://github.com/PolymerElements/paper-styles/blob/v2.0.0/default-theme.html
https://github.com/PolymerElements/paper-styles/blob/v2.0.0/element-styles/paper-material-styles.html
https://github.com/PolymerElements/paper-styles/blob/v2.0.0/paper-styles.html
https://github.com/PolymerElements/paper-styles/blob/v2.0.0/shadow.html
https://github.com/PolymerElements/paper-styles/blob/v2.0.0/typography.html

paper-subheader 2.0.2
https://github.com/Collaborne/paper-subheader/blob/2.0.2/paper-subheader.html

paper-tabs v2.0.0
https://github.com/PolymerElements/paper-tabs/blob/v2.0.0/paper-tab.html
https://github.com/PolymerElements/paper-tabs/blob/v2.0.0/paper-tabs-icons.html
https://github.com/PolymerElements/paper-tabs/blob/v2.0.0/paper-tabs.html

paper-toggle-button v2.0.0
https://github.com/PolymerElements/paper-toggle-button/blob/v2.0.0/paper-toggle-button.html

paper-tooltip v2.0.1
https://github.com/PolymerElements/paper-tooltip/blob/v2.0.1/paper-tooltip.html

polymer v2.2.0
https://github.com/Polymer/polymer/blob/v2.2.0/lib/elements/array-selector.html
https://github.com/Polymer/polymer/blob/v2.2.0/lib/elements/custom-style.html
https://github.com/Polymer/polymer/blob/v2.2.0/lib/elements/dom-bind.html
https://github.com/Polymer/polymer/blob/v2.2.0/lib/elements/dom-if.html
https://github.com/Polymer/polymer/blob/v2.2.0/lib/elements/dom-module.html
https://github.com/Polymer/polymer/blob/v2.2.0/lib/elements/dom-repeat.html
https://github.com/Polymer/polymer/blob/v2.2.0/lib/legacy/class.html
https://github.com/Polymer/polymer/blob/v2.2.0/lib/legacy/legacy-element-mixin.html
https://github.com/Polymer/polymer/blob/v2.2.0/lib/legacy/mutable-data-behavior.html
https://github.com/Polymer/polymer/blob/v2.2.0/lib/legacy/polymer-fn.html
https://github.com/Polymer/polymer/blob/v2.2.0/lib/legacy/polymer.dom.html
https://github.com/Polymer/polymer/blob/v2.2.0/lib/legacy/templatizer-behavior.html
https://github.com/Polymer/polymer/blob/v2.2.0/lib/mixins/dir-mixin.html
https://github.com/Polymer/polymer/blob/v2.2.0/lib/mixins/element-mixin.html
https://github.com/Polymer/polymer/blob/v2.2.0/lib/mixins/gesture-event-listeners.html
https://github.com/Polymer/polymer/blob/v2.2.0/lib/mixins/mutable-data.html
https://github.com/Polymer/polymer/blob/v2.2.0/lib/mixins/property-accessors.html
https://github.com/Polymer/polymer/blob/v2.2.0/lib/mixins/property-effects.html
https://github.com/Polymer/polymer/blob/v2.2.0/lib/mixins/template-stamp.html
https://github.com/Polymer/polymer/blob/v2.2.0/lib/utils/array-splice.html
https://github.com/Polymer/polymer/blob/v2.2.0/lib/utils/async.html
https://github.com/Polymer/polymer/blob/v2.2.0/lib/utils/boot.html
https://github.com/Polymer/polymer/blob/v2.2.0/lib/utils/case-map.html
https://github.com/Polymer/polymer/blob/v2.2.0/lib/utils/debounce.html
https://github.com/Polymer/polymer/blob/v2.2.0/lib/utils/flattened-nodes-observer.html
https://github.com/Polymer/polymer/blob/v2.2.0/lib/utils/flush.html
https://github.com/Polymer/polymer/blob/v2.2.0/lib/utils/gestures.html
https://github.com/Polymer/polymer/blob/v2.2.0/lib/utils/import-href.html
https://github.com/Polymer/polymer/blob/v2.2.0/lib/utils/mixin.html
https://github.com/Polymer/polymer/blob/v2.2.0/lib/utils/path.html
https://github.com/Polymer/polymer/blob/v2.2.0/lib/utils/render-status.html
https://github.com/Polymer/polymer/blob/v2.2.0/lib/utils/resolve-url.html
https://github.com/Polymer/polymer/blob/v2.2.0/lib/utils/settings.html
https://github.com/Polymer/polymer/blob/v2.2.0/lib/utils/style-gather.html
https://github.com/Polymer/polymer/blob/v2.2.0/lib/utils/templatize.html
https://github.com/Polymer/polymer/blob/v2.2.0/lib/utils/unresolved.html
https://github.com/Polymer/polymer/blob/v2.2.0/polymer-element.html
https://github.com/Polymer/polymer/blob/v2.2.0/polymer.html

shadycss v1.0.6
https://github.com/webcomponents/shadycss/blob/v1.0.6/apply-shim.html
https://github.com/webcomponents/shadycss/blob/v1.0.6/apply-shim.min.js
https://github.com/webcomponents/shadycss/blob/v1.0.6/custom-style-interface.html
https://github.com/webcomponents/shadycss/blob/v1.0.6/custom-style-interface.min.js

string_score v0.1.22
https://github.com/joshaven/string_score/blob/v0.1.22/string_score.min.js

vkBeautify v1.0.0
https://github.com/frigus02/vkBeautify/blob/v1.0.0/vkbeautify.js

web-animations-js 2.3.1
https://github.com/web-animations/web-animations-js/blob/2.3.1/web-animations-next-lite.min.js

webcomponentsjs v1.0.13
https://github.com/Polymer/webcomponentsjs/blob/v1.0.13/webcomponents-hi-ce.js
https://github.com/Polymer/webcomponentsjs/blob/v1.0.13/webcomponents-hi-sd-ce.js
https://github.com/Polymer/webcomponentsjs/blob/v1.0.13/webcomponents-hi.js
https://github.com/Polymer/webcomponentsjs/blob/v1.0.13/webcomponents-lite.js
https://github.com/Polymer/webcomponentsjs/blob/v1.0.13/webcomponents-loader.js
https://github.com/Polymer/webcomponentsjs/blob/v1.0.13/webcomponents-sd-ce.js
```
