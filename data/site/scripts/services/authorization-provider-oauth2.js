'use strict';

angular.module('app')
    .factory('$authorizationProviderOAuth2', ['$authorization', '$mdDialog', '$rester', '$q', 'jwtHelper', '$data', '$window', '$variables',
        function ($authorization, $mdDialog, $rester, $q, jwtHelper, $data, $window, $variables) {

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
                        let keyValue = part.split('=');
                        return [
                            keyValue[0],
                            decodeURIComponent(keyValue[1])
                        ];
                    })
                    .fromPairs()
                    .value();
            }

            function generateUri(base, params) {
                return base + '?' + encodeQueryString(params);
            }

            function createToken(config, tokenResponse) {
                let token = new $data.AuthorizationToken();
                token.providerId = 3;
                token.configurationId = config.id;

                token.scheme = 'Bearer';
                token.token = tokenResponse.access_token;

                try {
                    let tokenPayload = jwtHelper.decodeToken(tokenResponse.access_token),
                        userId = tokenPayload.sub || tokenPayload.name_id || tokenPayload.unique_name,
                        userName = tokenPayload.name;

                    if (userName && userId) {
                        token.title = `${userName} (${userId})`;
                    } else {
                        token.title = userName || userId;
                    }
                } catch (e) {
                    token.title = 'Unknown';
                }

                if (tokenResponse.expires_in) {
                    token.expirationDate = new Date(Date.now() + tokenResponse.expires_in * 1000);
                }

                return token;
            }

            function sendAuthorizationRequest(config, responseType) {
                const params = {
                    response_type: responseType,
                    client_id: config.clientId,
                    redirect_uri: config.redirectUri
                };

                if (config.scope) {
                    params.scope = config.scope;
                }

                return $rester.sendBrowserRequest({
                    url: generateUri(config.authorizationRequestEndpoint, params),
                    targetUrl: config.redirectUri
                });
            }

            function sendAccessTokenRequest(config, accessTokenRequestParams) {
                const accessTokenRequest = {
                    method: config.accessTokenRequestMethod,
                    headers: [
                        { name: 'Content-Type', value: 'application/x-www-form-urlencoded' }
                    ]
                };

                if (config.accessTokenRequestAuthentication === 'basic') {
                    const userName = encodeURI(config.clientId),
                          password = encodeURI(config.clientSecret),
                          token = $window.btoa(`${userName}:${password}`);

                    accessTokenRequest.headers.push({
                        name: 'Authorization',
                        value: `Basic ${token}`
                    });
                } else {
                    accessTokenRequestParams.client_id = config.clientId;
                    accessTokenRequestParams.client_secret = config.clientSecret;
                }

                if (config.accessTokenRequestMethod === 'GET') {
                    accessTokenRequest.url = generateUri(config.accessTokenRequestEndpoint, accessTokenRequestParams);
                } else {
                    accessTokenRequest.url = config.accessTokenRequestEndpoint;
                    accessTokenRequest.body = encodeQueryString(accessTokenRequestParams);
                }

                return $rester.sendRequest(accessTokenRequest);
            }

            function executeImplicitFlow(config) {
                return sendAuthorizationRequest(config, 'token').then(function (response) {
                    // Some oauth2 requests return the authorization response in the search
                    // part of the url instead of the fragment part. So we just check both.

                    let url = new URL(response.url),
                        resultFromHash = decodeQueryString(url.hash.substr(1)),
                        resultFromSearch = decodeQueryString(url.search.substr(1));

                    if (resultFromHash.access_token && resultFromHash.token_type) {
                        return createToken(config, resultFromHash);
                    } else if (resultFromSearch.access_token && resultFromSearch.token_type) {
                        return createToken(config, resultFromSearch);
                    } else if (resultFromHash.error) {
                        return $q.reject(`Authorization error: ${resultFromHash.error} (Description: ${resultFromHash.error_description}, URI: ${resultFromHash.error_uri}).`);
                    } else if (resultFromSearch.error) {
                        return $q.reject(`Authorization error: ${resultFromSearch.error} (Description: ${resultFromSearch.error_description}, URI: ${resultFromSearch.error_uri}).`);
                    } else {
                        return $q.reject(`Invalid authorization response.`);
                    }
                });
            }

            function executeCodeFlow(config) {
                return sendAuthorizationRequest(config, 'code').then(function (response) {
                    let url = new URL(response.url);

                    if (url.searchParams.has('code')) {
                        let accessTokenRequestParams = {
                            grant_type: 'authorization_code',
                            code: url.searchParams.get('code'),
                            redirect_uri: config.redirectUri
                        };

                        return sendAccessTokenRequest(config, accessTokenRequestParams);
                    } else if (url.searchParams.has('error')) {
                        let error = url.searchParams.get('error'),
                            errorDescription = url.searchParams.get('error_description'),
                            errorUri = url.searchParams.get('error_uri');

                        return $q.reject(`Authorization error: ${error} (Description: ${errorDescription}, URI: ${errorUri}).`);
                    } else {
                        return $q.reject(`Invalid authorization response.`);
                    }
                }).then(function (response) {
                    let body = JSON.parse(response.body);
                    if (response.status === 200) {
                        return createToken(config, body);
                    } else if (response.status === 400) {
                        return $q.reject(`Access token error: ${body.error} (Description: ${body.error_description}, URI: ${body.error_uri}).`);
                    } else {
                        return $q.reject(`Invalid access token response.`);
                    }
                });
            }

            function executeResourceOwnerPasswordCredentialsFlow(config) {
                return $mdDialog.show({
                    templateUrl: 'views/dialogs/authorization-provider-oauth2-resource-owner-generate-token.html',
                    controller: 'DialogAuthorizationProviderOAuth2ResourceOwnerGenerateTokenCtrl'
                }).then(credentials => {
                    const accessTokenRequestParams = {
                        grant_type: 'password',
                        username: credentials.username,
                        password: credentials.password
                    };

                    if (config.scope) {
                        accessTokenRequestParams.scope = config.scope;
                    }

                    return sendAccessTokenRequest(config, accessTokenRequestParams);
                }).then(function (response) {
                    let body = JSON.parse(response.body);
                    if (response.status === 200) {
                        return createToken(config, body);
                    } else if (response.status === 400 || response.status === 401) {
                        return $q.reject(`Access token error: ${body.error} (Description: ${body.error_description}, URI: ${body.error_uri}).`);
                    } else {
                        return $q.reject(`Invalid access token response.`);
                    }
                });
            }

            AuthorizationProviderOAuth2.prototype.generateToken = function (config) {
                if (config.enableVariables) {
                    config = $variables.replace(config);
                }

                if (config.flow === 'code') {
                    return executeCodeFlow(config);
                } else if (config.flow === 'implicit') {
                    return executeImplicitFlow(config);
                } else if (config.flow === 'resource_owner') {
                    return executeResourceOwnerPasswordCredentialsFlow(config);
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
