'use strict';

angular.module('app')
    .factory('$authorizationProviderOAuth2', ['$authorization', '$mdDialog', '$rester', '$q', 'jwtHelper', '$data',
        function ($authorization, $mdDialog, $rester, $q, jwtHelper, $data) {
        
            function AuthorizationProviderOAuth2() {
                $authorization.AuthorizationProvider.call(this, 3, 'OAuth 2', true);
            }

            AuthorizationProviderOAuth2.prototype = new $authorization.AuthorizationProvider();

            function encodeQueryString(params) {
                return Object.keys(params)
                    .map(p => `${p}=${encodeURIComponent(params[p])}`)
                    .join('&');
            }

            function decodeQueryString(str) {
                return _(str.split('&'))
                    .map(part => {
                        var keyValue = part.split('=');
                        return [
                            keyValue[0],
                            decodeURIComponent(keyValue[1])
                        ];
                    })
                    .zipObject()
                    .value();
            }

            function generateUri(base, params) {
                return base + '?' + encodeQueryString(params);
            }

            function createToken(config, tokenResponse) {
                var token = new $data.AuthorizationToken();
                token.providerId = 3;
                token.configurationId = config.id;

                if (tokenResponse.token_type !== 'Bearer') {
                    throw new Error(`Unsupported token type ${tokenResponse.token_type}.`);
                }

                token.scheme = tokenResponse.token_type;
                token.token = tokenResponse.access_token;

                try {
                    var tokenPayload = jwtHelper.decodeToken(tokenResponse.access_token),
                        name = tokenPayload.sub || tokenPayload.name || tokenPayload.name_id || tokenPayload.unique_name;

                    token.title = name;
                } catch (e) {
                    token.title = 'Unknown';
                }

                if (tokenResponse.expires_in) {
                    token.expirationDate = new Date(Date.now() + (tokenResponse.expires_in * 1000));
                }

                return token;
            }

            function executeImplicitFlow(config) {
                var params = {
                    response_type: 'token',
                    client_id: config.clientId,
                    redirect_uri: config.redirectUri
                };

                if (config.scope) {
                    params.scope = config.scope;
                }

                return $rester.sendBrowserRequest({
                    url: generateUri(config.authorizationRequestEndpoint, params),
                    targetUrl: config.redirectUri
                }).then(function (response) {
                    var url = new URL(response.url),
                        result = decodeQueryString(url.hash.substr(1));

                    if (result.access_token && result.token_type) {
                        return createToken(config, result);
                    } else if (result.error) {
                        return $q.reject(`Authorization error: ${result.error} (Description: ${result.error_description}, URI: ${result.error_uri}).`);
                    } else {
                        return $q.reject(`Invalid authorization response.`);
                    }                    
                });
            }

            function executeCodeFlow(config) {
                var params = {
                    response_type: 'code',
                    client_id: config.clientId,
                    redirect_uri: config.redirectUri
                };

                if (config.scope) {
                    params.scope = config.scope;
                }

                return $rester.sendBrowserRequest({
                    url: generateUri(config.authorizationRequestEndpoint, params),
                    targetUrl: config.redirectUri
                }).then(function (response) {
                    var url = new URL(response.url);

                    if (url.searchParams.has('code')) {
                        var accessTokenRequest = {
                                method: config.accessTokenRequestMethod,
                                headers: {
                                    'Content-Type': 'application/x-www-form-urlencoded'
                                }
                            },
                            accessTokenRequestParams = {
                                grant_type: 'authorization_code',
                                code: url.searchParams.get('code'),
                                redirect_uri: config.redirectUri,
                                client_id: config.clientId,
                                client_secret: config.clientSecret
                            };

                        if (config.accessTokenRequest.method === 'GET') {
                            accessTokenRequest.url = generateUri(config.accessTokenRequestEndpoint, accessTokenRequestParams);
                        } else {
                            accessTokenRequest.url = config.accessTokenRequestEndpoint;
                            accessTokenRequest.body = encodeQueryString(accessTokenRequestParams);
                        }

                        return $rester.sendRequest(accessTokenRequest);
                    } else if (url.searchParams.has('error')) {
                        var error = url.searchParams.get('error'),
                            errorDescription = url.searchParams.get('error_description'),
                            errorUri = url.searchParams.get('error_uri');

                        return $q.reject(`Authorization error: ${error} (Description: ${errorDescription}, URI: ${errorUri}).`);
                    } else {
                        return $q.reject(`Invalid authorization response.`);
                    }
                }).then(function (response) {
                    var body = JSON.parse(response.body);
                    if (response.status === 200) {
                        return createToken(config, body);
                    } else if (response.status === 400) {
                        return $q.reject(`Access token error: ${body.error} (Description: ${body.error_description}, URI: ${body.error_uri}).`);
                    } else {
                        return $q.reject(`Invalid access token response.`);
                    }
                });
            }

            AuthorizationProviderOAuth2.prototype.generateToken = function (config) {
                if (config.flow === 'code') {
                    return executeCodeFlow(config);
                } else if (config.flow === 'implicit') {
                    return executeImplicitFlow(config);
                } else {
                    return $q.reject(`Invalid flow "${config.flow}".`);
                }
            };

            AuthorizationProviderOAuth2.prototype.createConfiguration = function () {
                return this.editConfiguration({});
            };

            AuthorizationProviderOAuth2.prototype.editConfiguration = function (config) {
                config.providerId = 3;

                return $mdDialog.show({
                    templateUrl: 'views/dialogs/authorization-provider-oauth2-configuration.html',
                    controller: 'DialogAuthorizationProviderOAuth2ConfigurationCtrl',
                    locals: {
                        config: config
                    }
                });
            };

            return new AuthorizationProviderOAuth2();

        }
    ]);
