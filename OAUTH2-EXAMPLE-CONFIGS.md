# Example OAuth2 Configurations

[OAuth 2 RFC](http://tools.ietf.org/html/rfc6749)

## Google

Configuration                               | Value
------------------------------------------- | -------------------------------------------
OAuth 2 Flow                                | Authorization Code
Authorization Request: Endpoint             | https://accounts.google.com/o/oauth2/auth
Access Token Request: Method                | POST
Access Token Request: Endpoint              | https://accounts.google.com/o/oauth2/token
Access Token Request: Client Authentication | HTTP Basic authentication
Client ID                                   | &lt;Receive from Google Developers Console&gt;
Client Secret                               | &lt;Receive from Google Developers Console&gt;
Redirect URI                                | &lt;Receive from Google Developers Console&gt;
Scope                                       | &lt;Receive from Google API documentation (e.g. https://www.googleapis.com/auth/userinfo.email)&gt;

Configuration                   | Value
------------------------------- | -------------------------------------------
OAuth 2 Flow                    | Implicit
Authorization Request: Endpoint | https://accounts.google.com/o/oauth2/auth
Client ID                       | &lt;Receive from Google Developers Console&gt;
Redirect URI                    | &lt;Receive from Google Developers Console&gt;
Scope                           | &lt;Receive from Google API documentation (e.g. https://www.googleapis.com/auth/userinfo.email)&gt;
