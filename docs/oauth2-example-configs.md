# Example OAuth2 Configurations

[OAuth 2 RFC](http://tools.ietf.org/html/rfc6749)


## Google

### Authorization Code flow

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

### Implicit flow

Configuration                   | Value
------------------------------- | -------------------------------------------
OAuth 2 Flow                    | Implicit
Authorization Request: Endpoint | https://accounts.google.com/o/oauth2/auth
Client ID                       | &lt;Receive from Google Developers Console&gt;
Redirect URI                    | &lt;Receive from Google Developers Console&gt;
Scope                           | &lt;Receive from Google API documentation (e.g. https://www.googleapis.com/auth/userinfo.email)&gt;


## Keycloak

You can receive the client secret from the *Installation* tab of the client configuration in the Keycloak
admin console. Just select the *Format Option* *Keycloak OIDC JSON* and copy the value for of the *realm-public-key*.

### Authorization Code flow

Configuration                               | Value
------------------------------------------- | -------------------------------------------
OAuth 2 Flow                                | Authorization Code
Authorization Request: Endpoint             | http://[server]/auth/realms/[realm]/protocol/openid-connect/auth
Access Token Request: Method                | POST
Access Token Request: Endpoint              | http://[server]/auth/realms/[realm]/protocol/openid-connect/token
Access Token Request: Client Authentication | HTTP Basic authentication
Client ID                                   | &lt;Receive from Keycloak admin page&gt;
Client Secret                               | &lt;Receive from Keycloak admin page&gt;
Redirect URI                                | &lt;Receive from Keycloak admin page&gt;

### Implicit flow

Configuration                               | Value
------------------------------------------- | -------------------------------------------
OAuth 2 Flow                                | Implicit
Authorization Request: Endpoint             | http://[server]/auth/realms/[realm]/protocol/openid-connect/auth
Client ID                                   | &lt;Receive from Keycloak admin page&gt;
Redirect URI                                | &lt;Receive from Keycloak admin page&gt;

### Resource Owner Password Credentials

Configuration                               | Value
------------------------------------------- | -------------------------------------------
OAuth 2 Flow                                | Resource Owner Password Credentials
Access Token Request: Endpoint              | http://[server]/auth/realms/[realm]/protocol/openid-connect/token
Access Token Request: Client Authentication | HTTP Basic authentication
Client ID                                   | &lt;Receive from Keycloak admin page&gt;
Client Secret                               | &lt;Receive from Keycloak admin page&gt;
