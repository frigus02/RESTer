# Icons

## Firefox

### Sizes

As the [documentation](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/manifest.json/icons) states, Firefox recommends at least an icon in 48x48. For higher resoltion displays, you should provide double-sized versions of all your icons though. So we use these sizes:

-   48x48
-   96x96

This results in:

```json
"icons": {
    "48": "images/icon48.png",
    "96": "images/icon96.png"
}
```

For the browser action, Firefox allows to use an SVG icon ([documentation](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/manifest.json/browser_action#Choosing_icon_sizes)). This would be the best option. However Firefox also supports `theme_icons`, which let you specify light icons for dark themes. Here you can only specify fixed sized PNGs. Theme matching icons are more important to me, so we opt for PNGs and make use of the `theme_icons`:

```json
"browser_action": {
    "default_icon": {
        "16": "images/icon16.png",
        "24": "images/icon24.png",
        "32": "images/icon32.png"
    },
    "theme_icons": [
        {
            "dark": "images/icon16.png",
            "light": "images/icon-light16.png",
            "size": 16
        },
        {
            "dark": "images/icon24.png",
            "light": "images/icon-light24.png",
            "size": 24
        },
        {
            "dark": "images/icon32.png",
            "light": "images/icon-light32.png",
            "size": 32
        }
    ]
}
```

### Color

Firefox defines icon colors in the [Photon Design System](http://design.firefox.com/photon/visuals/color.html#icons-and-other-elements). You should use:

-   Grey 90 (#0c0c0d) fill with 80% opacity on light background for primary icons.
-   Grey 10 (#f9f9fa) fill with 80% opacity on dark background for primary icons.

## Chrome

As the [documentation](https://developer.chrome.com/extensions/manifest/icons) states, Chrome wants to have icons in the sizes:

-   48x48: used in the extensions management page (chrome://extensions)
-   128x128: used during installation and by the Chrome Web Store

This results in:

```json
"icons": {
    "48": "images/icon48.png",
    "128": "images/icon128.png"
}
```

For the browser action, the [documentation](https://developer.chrome.com/extensions/browserAction#icon) states, you should use a 16-dip square icon. We will use the following:

-   16x16: factor 1x
-   24x24: factor 1.5x
-   32x32: factor 2x

This results in:

```json
"browser_action": {
    "default_icon": {
        "16": "images/icon16.png",
        "24": "images/icon24.png",
        "32": "images/icon32.png"
    }
}
```
