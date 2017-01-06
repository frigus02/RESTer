# Icons

## Firefox

As the [documentation](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/manifest.json/icons) states, Firefox recommends at least an icon in 48x48. For higher resoltion displays, you should provide double-sized versions of all your icons though. So we use these sizes:

*   48x48
*   96x96

This results in:

    "icons": {
        "48": "images/icon48.png",
        "96": "images/icon96.png"
    }

For the browser action, Firefox allows to use an SVG icon ([documentation](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/manifest.json/browser_action#Choosing_icon_sizes)). This is easily the best option, so we use it. This results in:

    "browser_action": {
        "default_icon": "images/icon.svg"
    }

## Chrome

As the [documentation](https://developer.chrome.com/extensions/manifest/icons) states, Chrome wants to have icons in the sizes:

*   48x48: used in the extensions management page (chrome://extensions)
*   128x128: used during installation and by the Chrome Web Store

This results in:

    "icons": {
        "48": "images/icon48.png",
        "128": "images/icon128.png"
    }

For the browser action, the [documentation](https://developer.chrome.com/extensions/browserAction#icon) states, you should use a 16-dip square icon. We will use the following:

*   16x16: factor 1x
*   24x24: factor 1.5x
*   32x32: factor 2x

This results in:

    "browser_action": {
        "default_icon": {
            "16": "images/icon16.png",
            "24": "images/icon24.png",
            "32": "images/icon32.png"
        }
    }
