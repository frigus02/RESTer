# RESTer

A REST client for almost any web service.

You can...

* perform HTTP requests with any method, URL, body and custom headers.
* save favorite requests and organize them in collections.
* view a history of your requests, which includes the full request and response.

The add-on supports the following goodies:

* Create and save your authorization headers with Basic or OAuth2 authentication.
* Use shortcuts for the frequently used actions (try pressing "?" to see the available shortcuts for the current context).

## Develop

### Dependencies

Install the dependencies with the following command:

    npm install

### Test

Then user either the following command to just test the website locally (when doing this, you might want to include the *rester.mock.js* service, instead of the real *rester.js* service, because the addon is not available):

    npm run server

Or you can use one of the following shortcuts for *jpm* to run the full addon:

    npm run post
    npm run watch

### Add JavaScript libraries

Use *bower* to install new JavaScript dependencies. After including dependencies in the *index.html* file, execute the following command to copy the required file to the *data/site* folder.

    npm run copybower
