# RESTer

A REST client for almost any web service.

You can...

* perform HTTP requests with any method, URL, body and custom headers.
* save favorite requests and organize them in collections.
* view a history of your requests, which includes the full request and response.

The add-on supports the following goodies:

* Create and save your authorization headers with Basic or OAuth2 authentication.
* Use placeholders in saved requests.
* Use shortcuts for the frequently used actions (try pressing "?" to see the available shortcuts for the current context).

## Develop

### Dependencies

The project requires:

* `node` in a version >= 4.
* The package `jpm` to be installed globally.

If you are using windows you should turn off autocrlf in git, so files fetched from bower remain exactly the same. This is required because reviewers on AMO compare third party libaries by their MD5 hash.

    git config --global core.autocrlf input

Install all other dependencies with the following command:

    npm install

Windows users might need the argument `--msvs_version=2013` to build the dependencies of browser-sync.

### Test

The addon is basically split in two parts:

*   Website: UI
*   Background: Data storage, HTTP requests

The website relies on the background part, so you need to make sure a recent version of it is installed.

Working on the website works best with livereload features. To have them, first make sure the background code will attach to localhost URLs by setting the preference `extensions.rester@kuehle.me.additionalPageModIncludes` in about:config to `["http://localhost:3000/*"]` and restarting the browser. Then launch the website locally:

    npm start

### Package

To package the addon for AMO, run the following commands:

    .\tools\build.ps1
    .\tools\package.ps1
