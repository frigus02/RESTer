# RESTer

A REST client for almost any web service.

Download for: [Firefox](https://addons.mozilla.org/firefox/addon/rester) | [Google Chrome](https://chrome.google.com/webstore/detail/rester/eejfoncpjfgmeleakejdcanedmefagga)

You can...

*   perform HTTP requests with any method, URL, body and custom headers.
*   save favorite requests and organize them in collections.
*   view a history of your requests, which includes the full request and response.

The add-on supports the following goodies:

*   Create and save your authorization headers with Basic or OAuth2 authentication.
*   Use placeholders in saved requests.
*   Use shortcuts for the frequently used actions (try pressing "?" to see the available shortcuts for the current context).

## Develop

### Dependencies

The project requires:

*   `node` in a version >= 6.

Install all other dependencies with the command:

    npm install

### Test

WebExtensions enfore a content security policy (CSP) for all sites in the add-on, which does not allow inline scripts. However, as the main site uses Polymer, a big amount of the JavaScript is written as inline scripts. This affects both the add-on code itself and dependencies.

To make the browser load the add-on, you should run:

    npm start

This will generate a working add-on in the folder *.build*, where all JavaScript code is extracted into separate script files. It will also watch files for changes and update the folder accordingly.

To load the add-on in the browser:

*   **Firefox**: Go to [about:debugging](about:debugging), click on "Load Temporary Add-on" and select the file *manifest.json* inside the *.build* folder.
*   **Chrome**: Go to [chrome://extensions](chrome://extensions), check the box "Developer mode", click on "Load unpacked extension..." and select the folder *.build*.

### Package

To create packages for AMO and the Chrome Web Store run:

    npm run package

Afterwards you will find the generated files in the folder *.package*.
