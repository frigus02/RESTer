# Permissions

RESTer tries to request as few permissions as possible. Find below which permissions
are requested and why.

## Access your data for all websites

Technical permission names: `webRequest`, `webRequestBlocking`, `<all_urls>`

In order to inspect the request and response of HTTP requests, Firefox requires an extension to request permissions to the URL the request is send to. Because RESTer allows you to make requests to every website, it needs permissions to all websites. And this is exactly the "Access your data for all websites" permission you see.

With this permission an extension can inspect and change all requests made to every website you visit. RESTer makes sure to only inspect its own requests by limiting the scope to requests in its tab. This way RESTer will never see data from any website you open in any other tab.

## Download files and read and modify the browser’s download history

Technical permission names: `downloads`

When you export your data RESTer will trigger a download of the exported file. This could also be achieved without the download permission. However with the permission RESTer can provide a nicer user experience.

## Store unlimited amount of client-side data

Technical permission names: `storage`, `unlimitedStorage`

By default RESTer will store a history of all your requests and responses. In theory this can generate a large amount of data over time. To make sure you don't loose anything unexpectedly, RESTer requests this permission.

## (On demand) Access cookies

Technical permission names: `cookies`

When you use the cookie authorization feature in RESTer, it needs to be able to read the cookies required to do the authentication. This permission is only requested when you use the cookie authorization the first time.

## Other

Technical permission names: `activeTab`

When you click on the toolbar button to start RESTer, RESTer tries to find out if your current tab shows the new tab page. In this case RESTer loads itself in the current tab instead of opening a new one. On order to see the URL of the current tab, RESTer requires the `activeTab` permission.
