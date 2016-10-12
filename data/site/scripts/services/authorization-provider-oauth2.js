'use strict';

angular.module('app')
    .factory('$authorizationProviderOAuth2', ['$authorization', '$mdDialog', '$rester', '$q', '$window', '$variables',
        function ($authorization, $mdDialog, $rester, $q, $window, $variables) {

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

            /**
             * Decode a JSON web token.
             *
             * Credits: https://github.com/auth0/angular-jwt
             */
            function decodeJwt(token) {
                const parts = token.split('.');

                if (parts.length !== 3) {
                    throw new Error('JWT must have 3 parts');
                }

                let payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
                switch (payload.length % 4) {
                    case 0: { break; }
                    case 2: { payload += '=='; break; }
                    case 3: { payload += '='; break; }
                    default: {
                        throw 'Illegal base64url string!';
                    }
                }

                const decodedPayload = $window.decodeURIComponent($window.escape($window.atob(payload)));
                if (!decodedPayload) {
                    throw new Error('Cannot decode the token');
                }

                return JSON.parse(decodedPayload);
            }

            function createToken(config, tokenResponse) {
                let token = {};
                token.providerId = 3;
                token.configurationId = config.id;

                token.scheme = 'Bearer';
                token.token = tokenResponse.access_token;

                try {
                    let tokenPayload = decodeJwt(tokenResponse.access_token),
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

                if (config.enableVariables) {
                    token.title += ` (Environment: ${config.env.name})`;
                }

                if (tokenResponse.expires_in) {
                    token.expirationDate = new Date(Date.now() + tokenResponse.expires_in * 1000);
                }

                return token;
            }

            function createError(...lines) {
                return new Error(lines.join('\n'));
            }

            function tryParseJson(str, defaultValue) {
                try {
                    return JSON.parse(str);
                } catch (e) {
                    return defaultValue;
                }
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

            function validateAuthorizationResponse(response, requiredProperties) {
                // Some authorization servers return the authorization response in the search
                // part of the url and some in the fragment part. So we just check both.

                const url = new URL(response.url),
                      hash = decodeQueryString(url.hash.substr(1)),
                      search = decodeQueryString(url.search.substr(1));

                if (requiredProperties.every(p => hash[p])) {
                    return hash;
                } else if (requiredProperties.every(p => search[p])) {
                    return search;
                } else if (hash.error) {
                    throw createError(`Authorization error: ${hash.error}.`,
                        `Description: ${hash.error_description}`,
                        `URI: ${hash.error_uri}`);
                } else if (search.error) {
                    throw createError(`Authorization error: ${search.error}.`,
                        `Description: ${search.error_description}`,
                        `URI: ${search.error_uri}`);
                } else {
                    throw createError('Invalid authorization response.',
                        `Got url: ${response.url}`,
                        `Expected all of these properties or the property "error" in the query or fragment component: ${requiredProperties.join(', ')}`);
                }
            }

            function validateAccessTokenResponse(response, validErrorStatuses) {
                const body = tryParseJson(response.body, {});
                if (response.status === 200) {
                    if (body.access_token && body.token_type) {
                        return body;
                    } else {
                        throw createError('Invalid access token response.',
                            `Got body: ${response.body}`,
                            `Expected JSON object with properties: access_token, token_type`);
                    }
                } else if (validErrorStatuses.indexOf(response.status) !== -1) {
                    throw createError(`Access token error: ${body.error}.`,
                        `Description: ${body.error_description}`,
                        `URI: ${body.error_uri}`);
                } else {
                    throw createError('Invalid access token response.',
                        `Got status: ${response.status}`,
                        `Expected status of: 200, ${validErrorStatuses.join(', ')}`);
                }
            }

            function executeImplicitFlow(config) {
                return sendAuthorizationRequest(config, 'token').then(response => {
                    try {
                        const result = validateAuthorizationResponse(response, ['access_token', 'token_type']);
                        return createToken(config, result);
                    } catch (e) {
                        return $q.reject(e);
                    }
                });
            }

            function executeCodeFlow(config) {
                return sendAuthorizationRequest(config, 'code').then(response => {
                    try {
                        const result = validateAuthorizationResponse(response, ['code']);
                        const accessTokenRequestParams = {
                            grant_type: 'authorization_code',
                            code: result.code,
                            redirect_uri: config.redirectUri
                        };

                        return sendAccessTokenRequest(config, accessTokenRequestParams);
                    } catch (e) {
                        return $q.reject(e);
                    }
                }).then(response => {
                    try {
                        const result = validateAccessTokenResponse(response, [400]);
                        return createToken(config, result);
                    } catch (e) {
                        return $q.reject(e);
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
                }).then(response => {
                    try {
                        const result = validateAccessTokenResponse(response, [400, 401]);
                        return createToken(config, result);
                    } catch (e) {
                        return $q.reject(e);
                    }
                });
            }

            function prepareConfig(config) {
                if (config.enableVariables) {
                    config = $variables.replace(config);

                    const envId = $rester.settings.activeEnvironment;
                    return $rester.getEnvironment(envId, ['name']).then(env => {
                        config.env = env;
                        return config;
                    });
                } else {
                    return $q.resolve(config);
                }
            }

            AuthorizationProviderOAuth2.prototype.generateToken = function (config) {
                return prepareConfig(config).then(config => {
                    if (config.flow === 'code') {
                        return executeCodeFlow(config);
                    } else if (config.flow === 'implicit') {
                        return executeImplicitFlow(config);
                    } else if (config.flow === 'resource_owner') {
                        return executeResourceOwnerPasswordCredentialsFlow(config);
                    } else {
                        return $q.reject(createError('Invalid flow.',
                            `Got: ${config.flow}`,
                            `Expected one of: code, implicit, resource_owner`));
                    }
                });
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
