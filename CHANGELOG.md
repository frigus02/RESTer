# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

-   Always encode URL query params (name and value) when "Toogle URL params" is on. This fixes an issue where entering `#` in a query param would truncate the remaining URL (see [#628](https://github.com/frigus02/RESTer/issues/628)).
-   Fixes OAuth 2 issues with invalid `Origin` header in certain cases (see [#75](https://github.com/frigus02/RESTer/issues/75#issuecomment-1072638551)).

## [4.9.0] - 2022-02-13

### Added

-   Support `NaN` in JSON for pretty printing/beautifying (see [#593](https://github.com/frigus02/RESTer/issues/593)).

## [4.8.2] - 2022-01-26

### Fixed

-   Only url-encode variables in request body (see [#583](https://github.com/frigus02/RESTer/issues/583)).

## [4.8.1] - 2022-01-23

### Fixed

-   Encode variables in form encoded request body (see [#573](https://github.com/frigus02/RESTer/issues/573)).

## [4.8.0] - 2021-11-17

### Changed

-   The `webRequest` and `webRequestBlocking` permissions are not optional. RESTer requests them automatically the first time a request is sent. Neither Firefox, nor Chrome currently show a permission prompt for that. Making those permissions optional allows RESTer to work in environments where those permissins are blocked (e.g. by Chrome Enterprise Policy).

## [4.7.0] - 2021-06-24

### Added

-   Troubleshooting advice for network errors (see [#397](https://github.com/frigus02/RESTer/issues/397)).
-   Heading and "no items" text to environment selection dialog (see [#360](https://github.com/frigus02/RESTer/issues/360)).
-   Tooltip for URL parameters toggle button (see [#360](https://github.com/frigus02/RESTer/issues/360)).

### Changed

-   Use normal button to add new environment because the floating action button is hard to see (see [#360](https://github.com/frigus02/RESTer/issues/360)).

### Fixed

-   RESTer doesn't switch to plain body input if request content type is `text/plain` (see [#410](https://github.com/frigus02/RESTer/issues/410)).

## [4.6.0] - 2021-06-23

### Changed

-   JSON pretty printing/beautifying no longer modifies certain values in the JSON, e.g. big numbers ([#401](https://github.com/frigus02/RESTer/issues/401)).

    Before JSON was pretty printed using `JSON.stringify(JSON.parse(str), null, 4)`. This is easy and fast. But it normalizes values, e.g. a value like `0.0` changes to `0`. Since numbers are represented as `Number` after being parsed, very big numbers loose precision, e.g. `55871516310040211` turns into `55871516310040210`.

    The new formatting is a bit slower but does not modify any except whitespace.

    I think this is worth the performance cost. RESTer should not modify the response just because it pretty prints it. This could be very confusing.

## [4.5.2] - 2021-06-10

### Fixed

-   Fixed bug where Chrome would not send custom headers if an authorization was selected ([#399](https://github.com/frigus02/RESTer/issues/399)).

## [4.5.1] - 2021-06-09

### Fixed

-   Don't remove manually entered Cookie header when selecting an Authorization in the Authorization tab ([#395](https://github.com/frigus02/RESTer/issues/395)).

## [4.5.0] - 2021-06-02

### Added

-   PKCE support for OAuth 2 authorization code flow.

## [4.4.0] - 2021-03-05

### Changed

-   User name is now allowd to be empty in the basic auth dialog. (See [#289](https://github.com/frigus02/RESTer/issues/289))

## [4.3.3] - 2021-02-26

### Fixes

-   Fixed shell escaping for curl command generation. Query parameters and single quotes should now be escaped properly. (See [#287](https://github.com/frigus02/RESTer/issues/287)).

## [4.3.2] - 2020-10-07

### Fixed

-   Always render response body preview on white background. This improves color contrasts, especially with the Dark theme. (See [#181](https://github.com/frigus02/RESTer/issues/181)).
-   Update dependencies.

## [4.3.1] - 2020-09-16

### Fixes

-   Update dependencies.

## [4.3.0] - 2020-08-16

### Added

-   Some OAuth 2 servers don't supports URL-encoded credentials in HTTP Basic authentication headers ([#139])(https://github.com/frigus02/RESTer/issues/139)). RESTer now allows to turn URL-encoding off by choosing the "HTTP Basic authentication (no encode)" authentication option.
-   Added dialog in "Organize" page, which allows you to quickly delete multiple requests.

## [4.2.0] - 2020-06-14

### Added

-   Allow entering a custom title for basic authentication tokens.
-   Add OAuth 2 config title to generated tokens ([#140](https://github.com/frigus02/RESTer/issues/140)).

### Canged

-   Variable names can now only contain alphanumeric characters as well as `$._-`. This fixes an annoying behaviour when JSON objects were incorrectly identified as variables ([#116](https://github.com/frigus02/RESTer/issues/116)).
-   Increase width of environment variable dialog.
-   When an authentication token has been generated using the _Custom_ option and it's base64 encoded, show "Base64" in the token title.

## [4.1.1] - 2020-05-02

### Fixed

-   Fixed Postman export when there was a request with the same title as the collection of another request (might fix [#127](https://github.com/frigus02/RESTer/issues/127)).

## [4.1.0] - 2020-04-12

### Added

-   Added checkbox option for automatically encode token value to base64 string for custom authorization header dialog.

## [4.0.0] - 2020-03-14

### Changed

-   **Breaking**: RESTer now requires Firefox 63 or Chrome 67.
-   No longer append "Copy" to a request title when using the "Duplicate request" function. It turned out to be more annoying than helpful.

### Fixed

-   Fixed clean request mode in Chrome >= 72 ([#122](https://github.com/frigus02/RESTer/issues/122)).

## [3.11.2] - 2019-06-27

### Fixed

-   Fixed library list on about page.
-   Improve memory usage of large response bodies ([#106](https://github.com/frigus02/RESTer/issues/106)).

## [3.11.1] - 2019-06-06

### Fixed

-   Fixed UI bug in clean up dialog when history is empty ([#96](https://github.com/frigus02/RESTer/issues/96)).
-   Long auth tokens no longer break the page layout ([#101](https://github.com/frigus02/RESTer/issues/101)).

## [3.11.0] - 2019-06-05

### Added

-   Added option to show curl command for current request.

### Changed

-   Changed way of how to duplicate requests. The save button now just saves the current request. You can duplicate a request by clicking on the corresponding menu item in the "More options" menu (the icon with 3 dots in top right corner).

### Fixed

-   Auth tokens were not visible after reloading the page ([#97](https://github.com/frigus02/RESTer/issues/97)).

## [3.10.0] - 2019-03-12

### Added

-   Added more headers to the autocomplete list of request headers ([#87](https://github.com/frigus02/RESTer/issues/87)).

## [3.9.1] - 2018-12-18

### Fixed

-   Made client secret field in OAuth 2 configuration optional. Some servers allow empty client secrets for authentication ([#71](https://github.com/frigus02/RESTer/issues/71)).
-   Fixed request headers getting messed up when there were more than 10 headers ([#75](https://github.com/frigus02/RESTer/issues/75)).
-   Fixed export on Android ([#76](https://github.com/frigus02/RESTer/issues/76)).
-   Handle redirects correctly ([#79](https://github.com/frigus02/RESTer/issues/79)). In "Browser Requests" mode, RESTer now shows on the response, if the request was redirected. In "Clean Requests" mode, RESTer does not follow redirects and shows the 3xx response instead.

## [3.9.0] - 2018-07-25

### Added

-   Add history clean up dialog to Organize page.

### Changed

-   Allow basic authentication with an empty password ([#65](https://github.com/frigus02/RESTer/issues/65)).

### Fixed

-   Correctly detect content type when it contains a charset ([#66](https://github.com/frigus02/RESTer/issues/66)).

## [3.8.2] - 2018-06-17

### Fixed

-   Fixed detection of redirect URI in OAuth 2 flow, when specified redirect URI has an empty path. ([#63](https://github.com/frigus02/RESTer/issues/63))
-   In browser request mode, custom headers were appended to default headers. This resulted in unexpected behaviour for example in the `Accept` header ([#62](https://github.com/frigus02/RESTer/issues/62)). RESTer now correctly overrides headers: if you manually specify a header, it will no longer send the default one.

## [3.8.1] - 2018-04-25

### Fixed

-   Fixed environment variables in form body.
-   Fixed handling of OAuth2 redirect uris with ports.

## [3.8.0] - 2018-04-06

### Added

-   Open RESTer in current tab, when tab is on new tab page. This makes it easier to open RESTer in container tabs.

### Fixed

-   In browser request mode, when you manually specify a `Cookie` header and the browser has cookies stored for the domain, the `Cookie` header ended up corrupted. RESTer now correctly merges the cookies into one header.
-   After making a request all navigation items collapsed. This was not intentional. Now the active items stays expanded.

## [3.7.2] - 2018-02-14

### Fixed

-   Fixed updating of navigation after saving/deleting a request.

## [3.7.1] - 2018-02-13

### Fixed

-   Fixed error when using "Save as new" on a request while a response is currently visible.

## [3.7.0] - 2018-02-10

### Added

-   Added import and export in the Postman Collection Format. This is still basic, as it only supports requests (no environments or authentication configs).

### Fixed

-   Fixed deletion of requests, which was broken since the last update.

## [3.6.0] - 2018-01-28

### Added

-   Added option to expand the request page to the full available width.

### Changed

-   Changed build tools from gulp to webpack using [polymer-webpack-loader](https://github.com/webpack-contrib/polymer-webpack-loader). This made it possible to get rid of HTML imports entirely, which were always a bit flakey when used in extensions on Linux.

### Fixed

-   After saving a request the current response will now stay visible. Note: currently this only works if the request was saved at least once before.

## [3.5.1] - 2017-11-28

### Fixed

-   Long query parameters in the request broke the page layout.
-   Response header were not visible in Chrome.

## [3.5.0] - 2017-11-22

### Added

-   Light toolbar icon for dark Firefox theme.

### Fixed

-   Variables without value no longer remove the placeholder from the request.

## [3.4.0] - 2017-11-19

### Added

-   New "Cookie" authorization: It allows you to easily generate and store cookies for your sites and use for as authentication during the requests.

### Changed

-   Upper and lower case in header names is now preserved when sending the request. Previously case in all header names was ignored and they were send to the server all lower case.
-   Changed setting "Strip default headers" to "Request Mode". When it's set to "Browser Request" (default), RESTer will not send cookies, too. Previously cookies were always omitted.

## [3.3.1] - 2017-11-13

### Fixed

-   The new default protocol feature prefixed the URL with `http://` even if the URL started with an environment variable containing a protocol. It's fixed now.

## [3.3.0] - 2017-11-09

### Added

-   When you send a request to an URL without entering any protocol (e.g. `example.com`), RESTer will default to using `http://` instead of nothing.

### Fixed

-   When your OAuth 2 authorization endpoint URL contained a query string, the OAuth flow would not work at all.

## [3.2.1] - 2017-10-25

### Fixed

-   RESTer didn't load on Ubuntu and in Firefox 55 on Windows (again). I will make sure to test every change on these platforms from now on.

## [3.2.0] - 2017-10-24

### Added

-   Allow to abort/cancel requests. _(This only works for browsers, which support the abortable fetch.)_

### Fixed

-   When a request took longer than 1 second to complete, RESTer showed a wrong duration (1s was shown as 100s).

## [3.1.0] - 2017-09-23

### Added

-   Detailed request timings (queueing, DNS lookup, connecting, send request and downloading response).

### Fixed

-   RESTer didn't load on Ubuntu (and in Firefox 55 on Windows). This should be fixed now.

## [3.0.0] - 2017-08-18

### Added

-   Added "Full Size" option to request body. When enabled, the editor will be as high as its content. This should make it easier to keep an overview over large request bodies.

### Changed

-   Upgraded Polymer to version 2. There shouldn't be any bigger visible changes by this. However it ensures the project stays up-to-date.
-   Improved autocomplete dropdowns. They are now shown when you click in the input field, press arrow up/down key or just type, even when you previously closed the dropdown with escape. I hope this will feel good.
-   Convert Firefox extension to a full WebExtension. This makes it compatible with Firefix >= 57.
-   **Breaking**: RESTer is only able to keep your data when you upgrade from a version >= 2.0.0. When you currently have a version lower than this, please first upgrade to 2.0.0 and open the addon once. Then proceed with an upgrade to 3.0.0.

### Fixed

-   The `Content-Type` header was not set in the request for `multipart/form-data` requests, if the option _Strip default headers_ was enabled.
-   When you removed an existing query string from the request URL, RESTer automatically removed the question mark as well. This was not intended and is fixed now.

## [2.5.1] - 2017-07-03

### Fixed

-   Variables tab might not have been visible on first page load.
-   If you didn't click fast enough on a dropdown item, the autocomplete field didn't accept the selected value and stayed empty.

## [2.5.0] - 2017-06-25

### Added

-   Support for the OAuth 2 Client Credentials flow.

### Fixed

-   Variables did not work in form request body.

## [2.4.0] - 2017-05-20

### Added

-   Variable inputs now have a dropdown with the last used values.
-   If you have many environments, you might appreciate a quick environment selection dialog. You can now press Ctrl+Shift+E or click on the icon in the environments navigation item to bring it up. This allows to easier to select an environment without leaving the current request.
-   Variables can not be shown on the right side of a request, instead of in a tab. This should make them easier to use. This is behind a setting for now, because I'm not too happy with the design yet.

## [2.3.0] - 2017-04-16

### Added

-   Add a lite theme, which can be selected on the settings page.
-   Support for public OAuth 2 clients, which don't require a client secret.

### Fixed

-   The dropdown for the request method was hidden underneath the body input, when the body tab was selected. It's not anymore.
-   All fonts are now included in the extension, so it should no longer require an internet connection to load correctly.
-   It was possible that the body input looked like it wasn't updated, when switching requests. Now it should always show the correct content.
-   For `multipart/form-data` requests it was not possible to add a key multiple times, creating an array of values. Also the keys were incorrectly encoded. This should be fixed.

## [2.2.0] - 2017-03-05

### Added

-   Add option to view response body full size. This removes the extra scrolling for the response body. However, when the body is very big, this might slow down your browser.

### Changed

-   Change the way you set a content type header. Previously whenever you select a different body input method, the content type header was automatically changed. This could be confusing and unexpected. Now RESTer will tell you, when the body input method does not match the selected content type. Changing the content type is then a manual action.

### Fixed

-   Make it more obvious how to enter title and description for a request.
-   Make it possible to enter equal sign in form input mode of request body.

## [2.1.1] - 2017-02-16

### Fixed

-   Fix bug, where request cannot be sent, when not at least one file is selected.

## [2.1.0] - 2017-02-06

### Changed

-   The global option for OAuth 2 incognito mode is gone. There is now a button in every OAuth 2 configuration, which generates one token in incognito mode. I think the option is much more useful now.
-   Starting in version 2.0.0 RESTer runs slowly, when you storage large amounts of history data. This happens because in the new extension model in Firefox (called WebExtensions) it's not possible anymore to use IndexedDB in private browsing mode. So RESTer now uses the only other storage API available: chrome.storage.local. However this one is pretty slow in Firefox when handling bigger amounts of data (~50MB). Until I have a better solution, RESTer now automatically detects when it's running slow and offers to remove some older history data.

### Fixed

-   Fixed OAuth 2 flow in Firefox 51.
-   Fixed specifying a cookie header in the request.
-   Fixed pasting a string including "==" into the request body. Everything including after (including the equal signs) was cut off.
-   Fixed highlighting of active navigation item. Before sometimes a wrong item was highlighted.
-   Fixed UI glitches when entering a long value without spaces in the request body form value or environment value textboxes.

## [2.0.1] - 2017-01-16

### Fixed

-   The navigation accidentally showed all history items. Now it's again only the 5 newest items.
-   Fixed exception when a not existing environment was selected as active.

## [2.0.0] - 2017-01-14

### Added

-   Added option to open OAuth 2 logins in incognito window. This way you can more easily test token with multiple accounts.

### Changed

-   The add-on is now built on the [WebExtensions](https://developer.mozilla.org/en-US/Add-ons/WebExtensions) API, which makes it compatible with Google Chrome. This is the first version, where RESTer is also available in the Chrome Web Store.
-   **Breaking**: RESTer is only able to keep your data when you upgrade from a version >= 1.14.0. When you currently have a version lower than this, please first upgrade to 1.14.0 and open the addon once. Then proceed with an upgrade to 2.0.0.

## [1.17.0] - 2016-12-21

### Added

-   Support for multipart forms including files.

### Fixed

-   Smaller UI issues with navigation and autocompletion of input fields.

## [1.16.0] - 2016-12-10

### Changed

-   Switched framework from AngularJS to Polymer. AngularJS is discouraged (old versions are even banned) from AMO ([details](https://github.com/mozilla/addons-linter/blob/master/docs/third-party-libraries.md)).

## [1.15.2] - 2016-10-18

### Changed

-   Improved OAuth 2 error messages. It should be much easier now to figure out, why an authorization attempt didn't work.

### Fixed

-   Fixed saving of seting "Inspections for requests".

## [1.15.1] - 2016-10-08

### Fixed

-   Fixed deletion of history entries.
-   Fixed "Some variables have an empty value." message.

## [1.15.0] - 2016-09-27

### Changed

-   The Request title can be entered in the toolbar now.
-   Improved save and delete request buttons. They use a dropdown menu for confirmation now, which is much faster to use.
-   After deleting a request RESTer now jumps to the next request in the same collection.

### Fixed

-   When using environments in a request, the request would show up on the history page with the currently active environment. Now it correctly shows up with the values used when executing the request.
-   Removed validation from URL fields in OAuth 2 configuration, so environment variables can be used.

## [1.14.0] - 2016-08-20

### Added

-   Splash screen.
-   Support for private browsing mode.
-   Used environment in OAuth 2 token name, when variables are enabled in config.

## [1.13.0] - 2016-07-30

### Added

-   Shortcut Ctrl+E, which cycles through the active environments.
-   Support for OAuth 2 Resource Owner Password Credentials flow.
-   Use environment variables in OAuth 2 configurations.

### Fixed

-   Attempt to fix issue with missing toolbar icon by providing icons in all supported sizes.

## [1.12.1] - 2016-07-16

### Fixed

-   Improved all autocomplete fields (request method, headers, collection name). It's now possible to select any other input field or button with only one mouse click, when the dropdown is open.

## [1.12.0] - 2016-07-10

### Added

-   Added option to pin sidenav, so it always stays open (even on small screens).
-   Experimental response rendering, which should be better for large responses. Activate in settings.

### Changed

-   Send requests by pressing enter/return inside of an input field.

## [1.11.0] - 2016-06-27

### Added

-   Better structuring for requests in left navigation by nesting collections. Just use slashes in your collection names to create subnavigations.
-   Pretty print for XML responses.
-   Improve request body input (code folding, beautify code for JSON and XML).
-   Added more HTTP verbs to request method autocompletion.

### Fixed

-   Show dropdown of request method input field directly on focus.
-   Correctly use the entered text without the need to select something from the dropdown in request method input field.

## [1.10.0] - 2016-05-27

### Changed

-   Improve rendering of reponses. Should handle large responses a lot better now.

## [1.9.1] - 2016-05-24

### Fixed

-   Fixed bug for Firefox 46.

## [1.9.0] - 2016-05-22

### Added

-   Added request inspections about variable usage. This should help to avoid accidental mistakes like:
    -   Using placeholders with disabled variable feature.
    -   Using variales with empty values.

## [1.8.1] - 2016-05-17

### Fixed

-   Previous version did not pass the review, because MD5 hashes of angular did not match the ones from the angular repository. This was due to git converting line endings to CRLF during bower install.

## [1.8.0] - 2016-05-16

### Added

-   Show elapsed milliseconds for each request.
-   Quick open dialog (Ctrl+P) now search the request method and url in addition to the title.

## [1.7.0] - 2016-04-23

### Added

-   Added preview mode for HTML responses.
-   Added about page.

### Changed

-   Don't automatically strip default headers like Accept or User-Agent. There is now a setting to do this.

## [1.6.0] - 2016-04-03

### Added

-   New feature "environments": Allows to define stored sets of variables, which can be used in any request. May be used to test the same API against different hosts (e.g. local, dev, production).
-   UI improvements for navigation.

## [1.5.2] - 2016-03-17

### Fixed

-   Last version didn't really fix the problem. This one does.

## [1.5.1] - 2016-03-15

### Fixed

-   Fixed issue caused by last update, which made it impossible to send requests, when the new variable feature was disabled.

## [1.5.0] - 2016-03-13

### Added

-   New variables feature: You can define placeholders in the form {id} in any field in the request and fill the values in a separate tab. The values for these variables are not saved, which allows you to save a collection of request templates and only will in the needed values when you execute it.

### Fixed

-   Fix some bugs with the navigation when adding/updating requests.

## [1.4.0] - 2016-02-15

### Added

-   Added support for HTTP Basic authentication in access token request of OAuth 2 code flow.

### Fixed

-   Fixed issue with OAuth 2 implicit flow.

## [1.3.2] - 2016-02-10

### Fixed

-   Fixed bug in quick open dialog.

## [1.3.1] - 2016-02-09

### Fixed

-   Fixed bug when loading old history data.

## [1.3.0] - 2016-02-08

### Added

-   Special input fields for form data in body (application/x-www-form-urlencoded).
-   Button in request body to switch input modes (plain, xml, json, form data), which can automatically apply the correct Content-Type header.
-   Special input fields for query parameters in url.
-   Support for pressing enter in the dialogs to save.

### Changed

-   Removed tabs for response. Just show body underneath the headers.

### Fixed

-   Performance improvement of request page (sorry for making this page slow in the first place). Also response body language selection is nicer now.

## [1.2.2] - 2016-01-14

### Fixed

-   Removed validation of URL field to allow all kind of characters, e.g. spaces. This was especially annoying when typing in OData queries.

## [1.2.1] - 2015-10-28

### Fixed

-   Fixed rendering of text/plain responses.
-   Fixed requests with multiple completely identical headers.

## [1.2.0] - 2015-10-25

### Added

-   Smoother syntax highlighting for very large responses. The page will now always be fully responsive.
-   Options to toggle word wrap and pretty printing (pretty print is only available for JSON responses).
-   Option to manually set response language (in case the server did not return a content type header).

## [1.1.0] - 2015-10-11

### Added

-   Added shortcuts for some often used actions including a quick open dialog for saved requests similar to the file open function in Sublime Text. Just hit the question mark key (?) to see which shortcuts are available in the current context.

## [1.0.2] - 2015-09-16

### Added

-   When an authorization token is expired, this is now directly visible.
-   Intellisense for the request body is now determined from the Content-Type header.

### Fixed

-   There was a strange problem when typing a header name or value. This should now be fixed. Also it's now possible to add multiple headers with the same name.

## [1.0.1] - 2015-09-02

### Fixed

-   Removed OAuth 2 token_type check. This was implemented in a wrong way and is probably unnecessary anyway.

## [1.0.0] - 2015-09-01

### Added

-   Authorization for requests (OAuth 2, Basic and custom).

### Fixed

-   Smaller bugfixes and improvements.

## [0.0.2] - 2015-08-18

### Fixed

-   Fixed transition to new page after saving a request.
-   Fixed for multiprocess architecture.

## 0.0.1 - 2015-08-17

### Added

-   First release.

[unreleased]: https://github.com/frigus02/RESTer/compare/4.9.0...HEAD
[4.9.0]: https://github.com/frigus02/RESTer/compare/4.8.2...4.9.0
[4.8.2]: https://github.com/frigus02/RESTer/compare/4.8.1...4.8.2
[4.8.1]: https://github.com/frigus02/RESTer/compare/4.8.0...4.8.1
[4.8.0]: https://github.com/frigus02/RESTer/compare/4.7.0...4.8.0
[4.7.0]: https://github.com/frigus02/RESTer/compare/4.6.0...4.7.0
[4.6.0]: https://github.com/frigus02/RESTer/compare/4.5.2...4.6.0
[4.5.2]: https://github.com/frigus02/RESTer/compare/4.5.1...4.5.2
[4.5.1]: https://github.com/frigus02/RESTer/compare/4.5.0...4.5.1
[4.5.0]: https://github.com/frigus02/RESTer/compare/4.4.0...4.5.0
[4.4.0]: https://github.com/frigus02/RESTer/compare/4.3.3...4.4.0
[4.3.3]: https://github.com/frigus02/RESTer/compare/4.3.2...4.3.3
[4.3.2]: https://github.com/frigus02/RESTer/compare/4.3.1...4.3.2
[4.3.1]: https://github.com/frigus02/RESTer/compare/4.3.0...4.3.1
[4.3.0]: https://github.com/frigus02/RESTer/compare/4.2.0...4.3.0
[4.2.0]: https://github.com/frigus02/RESTer/compare/4.1.1...4.2.0
[4.1.1]: https://github.com/frigus02/RESTer/compare/4.1.0...4.1.1
[4.1.0]: https://github.com/frigus02/RESTer/compare/4.0.0...4.1.0
[4.0.0]: https://github.com/frigus02/RESTer/compare/3.11.2...4.0.0
[3.11.2]: https://github.com/frigus02/RESTer/compare/3.11.1...3.11.2
[3.11.1]: https://github.com/frigus02/RESTer/compare/3.11.0...3.11.1
[3.11.0]: https://github.com/frigus02/RESTer/compare/3.10.0...3.11.0
[3.10.0]: https://github.com/frigus02/RESTer/compare/3.9.1...3.10.0
[3.9.1]: https://github.com/frigus02/RESTer/compare/3.9.0...3.9.1
[3.9.0]: https://github.com/frigus02/RESTer/compare/3.8.2...3.9.0
[3.8.2]: https://github.com/frigus02/RESTer/compare/3.8.1...3.8.2
[3.8.1]: https://github.com/frigus02/RESTer/compare/3.8.0...3.8.1
[3.8.0]: https://github.com/frigus02/RESTer/compare/3.7.2...3.8.0
[3.7.1]: https://github.com/frigus02/RESTer/compare/3.7.1...3.7.2
[3.7.1]: https://github.com/frigus02/RESTer/compare/3.7.0...3.7.1
[3.7.0]: https://github.com/frigus02/RESTer/compare/3.6.0...3.7.0
[3.6.0]: https://github.com/frigus02/RESTer/compare/3.5.1...3.6.0
[3.5.1]: https://github.com/frigus02/RESTer/compare/3.5.0...3.5.1
[3.5.0]: https://github.com/frigus02/RESTer/compare/3.4.0...3.5.0
[3.4.0]: https://github.com/frigus02/RESTer/compare/3.3.1...3.4.0
[3.3.1]: https://github.com/frigus02/RESTer/compare/3.3.0...3.3.1
[3.3.0]: https://github.com/frigus02/RESTer/compare/3.2.1...3.3.0
[3.2.1]: https://github.com/frigus02/RESTer/compare/3.2.0...3.2.1
[3.2.0]: https://github.com/frigus02/RESTer/compare/3.1.0...3.2.0
[3.1.0]: https://github.com/frigus02/RESTer/compare/3.0.0...3.1.0
[3.0.0]: https://github.com/frigus02/RESTer/compare/2.5.1...3.0.0
[2.5.1]: https://github.com/frigus02/RESTer/compare/2.5.0...2.5.1
[2.5.0]: https://github.com/frigus02/RESTer/compare/2.4.0...2.5.0
[2.4.0]: https://github.com/frigus02/RESTer/compare/2.3.0...2.4.0
[2.3.0]: https://github.com/frigus02/RESTer/compare/2.2.0...2.3.0
[2.2.0]: https://github.com/frigus02/RESTer/compare/2.1.1...2.2.0
[2.1.1]: https://github.com/frigus02/RESTer/compare/2.1.0...2.1.1
[2.1.0]: https://github.com/frigus02/RESTer/compare/2.0.1...2.1.0
[2.0.1]: https://github.com/frigus02/RESTer/compare/2.0.0...2.0.1
[2.0.0]: https://github.com/frigus02/RESTer/compare/1.17.0...2.0.0
[1.17.0]: https://github.com/frigus02/RESTer/compare/1.16.0...1.17.0
[1.16.0]: https://github.com/frigus02/RESTer/compare/1.15.2...1.16.0
[1.15.2]: https://github.com/frigus02/RESTer/compare/1.15.1...1.15.2
[1.15.1]: https://github.com/frigus02/RESTer/compare/1.15.0...1.15.1
[1.15.0]: https://github.com/frigus02/RESTer/compare/1.14.0...1.15.0
[1.14.0]: https://github.com/frigus02/RESTer/compare/1.13.0...1.14.0
[1.13.0]: https://github.com/frigus02/RESTer/compare/1.12.1...1.13.0
[1.12.1]: https://github.com/frigus02/RESTer/compare/1.12.0...1.12.1
[1.12.0]: https://github.com/frigus02/RESTer/compare/1.11.0...1.12.0
[1.11.0]: https://github.com/frigus02/RESTer/compare/1.10.0...1.11.0
[1.10.0]: https://github.com/frigus02/RESTer/compare/1.9.1...1.10.0
[1.9.1]: https://github.com/frigus02/RESTer/compare/1.9.0...1.9.1
[1.9.0]: https://github.com/frigus02/RESTer/compare/1.8.1...1.9.0
[1.8.1]: https://github.com/frigus02/RESTer/compare/1.8.0...1.8.1
[1.8.0]: https://github.com/frigus02/RESTer/compare/1.7.0...1.8.0
[1.7.0]: https://github.com/frigus02/RESTer/compare/1.6.0...1.7.0
[1.6.0]: https://github.com/frigus02/RESTer/compare/1.5.2...1.6.0
[1.5.2]: https://github.com/frigus02/RESTer/compare/1.5.1...1.5.2
[1.5.1]: https://github.com/frigus02/RESTer/compare/1.4.0...1.5.1
[1.4.0]: https://github.com/frigus02/RESTer/compare/1.3.2...1.4.0
[1.3.2]: https://github.com/frigus02/RESTer/compare/1.3.1...1.3.2
[1.3.1]: https://github.com/frigus02/RESTer/compare/1.3.0...1.3.1
[1.3.0]: https://github.com/frigus02/RESTer/compare/1.2.2...1.3.0
[1.2.2]: https://github.com/frigus02/RESTer/compare/1.2.1...1.2.2
[1.2.1]: https://github.com/frigus02/RESTer/compare/1.2.0...1.2.1
[1.2.0]: https://github.com/frigus02/RESTer/compare/1.1.0...1.2.0
[1.1.0]: https://github.com/frigus02/RESTer/compare/1.0.2...1.1.0
[1.0.2]: https://github.com/frigus02/RESTer/compare/1.0.1...1.0.2
[1.0.1]: https://github.com/frigus02/RESTer/compare/1.0.0...1.0.1
[1.0.0]: https://github.com/frigus02/RESTer/compare/0.0.2...1.0.0
[0.0.2]: https://github.com/frigus02/RESTer/compare/0.0.1...0.0.2
