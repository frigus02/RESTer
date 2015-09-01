# Example OAuth2 Configurations

[http://tools.ietf.org/html/rfc6749](OAuth 2 RFC)

## Google

Configuration          | Value
---------------------- | -------------------------------------------
OAuth 2 Flow           | Authorization Code
Authorization endpoint | https://accounts.google.com/o/oauth2/auth
Access token method    | POST
Access token endpoint  | https://accounts.google.com/o/oauth2/token
Client ID              | &lt;Receive from Google Developers Console&gt;
Client Secret          | &lt;Receive from Google Developers Console&gt;
Redirect URI           | &lt;Receive from Google Developers Console&gt;
Scope                  | &lt;Receive from Google API documentation (e.g. https://www.googleapis.com/auth/userinfo.email)&gt;

Configuration          | Value
---------------------- | -------------------------------------------
OAuth 2 Flow           | Implicit
Authorization endpoint | https://accounts.google.com/o/oauth2/auth
Client ID              | &lt;Receive from Google Developers Console&gt;
Redirect URI           | &lt;Receive from Google Developers Console&gt;
Scope                  | &lt;Receive from Google API documentation (e.g. https://www.googleapis.com/auth/userinfo.email)&gt;
