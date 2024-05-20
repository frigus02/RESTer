import * as browserRequest from './browser-request.js';
import * as request from './request.js';
import { generateUri, encodeQueryString, decodeQueryString } from './encode.js';
import { prepareConfigWithEnvVariables } from './util.js';

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
        case 0: {
            break;
        }
        case 2: {
            payload += '==';
            break;
        }
        case 3: {
            payload += '=';
            break;
        }
        default: {
            throw 'Illegal base64url string!';
        }
    }

    const decodedPayload = window.decodeURIComponent(
        window.escape(window.atob(payload)),
    );
    if (!decodedPayload) {
        throw new Error('Cannot decode the token');
    }

    return JSON.parse(decodedPayload);
}

function createCodeVerifier() {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    return base64urlencode(array);
}

async function createCodeChallenge(codeVerifier) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return base64urlencode(new Uint8Array(digest));
}

function base64urlencode(octets) {
    return btoa(String.fromCharCode(...octets))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

function createToken(config, tokenResponse) {
    const token = {};

    token.scheme = 'Bearer';
    token.token = tokenResponse.access_token;
    token.title = config.title;

    try {
        let tokenPayload = decodeJwt(tokenResponse.access_token),
            userId =
                tokenPayload.sub ||
                tokenPayload.name_id ||
                tokenPayload.unique_name ||
                tokenPayload.uid,
            userName = tokenPayload.preferred_username || tokenPayload.name;

        if (userName && userId) {
            token.title += ` ${userName} (${userId})`;
        } else if (userName || userId) {
            token.title += ` ${userName || userId}`;
        }
    } catch {
        // TODO: I can't remember why this try-catch is here. I assume
        // decodeJwt can fail. But why swallow the error?
    }

    if (config.enableVariables && config.env) {
        token.title += ` (Environment: ${config.env.name})`;
    }

    if (tokenResponse.expires_in) {
        token.expirationDate = new Date(
            Date.now() + tokenResponse.expires_in * 1000,
        );
    }

    return token;
}

function createError(...lines) {
    return new Error(lines.join('\n'));
}

function tryParseJson(str, defaultValue) {
    try {
        return JSON.parse(str);
    } catch {
        return defaultValue;
    }
}

async function sendAuthorizationRequest(config, responseType) {
    const params = {
        response_type: responseType,
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
    };
    if (config.accessTokenRequestAuthentication === 'pkce') {
        params.code_challenge = await createCodeChallenge(config.codeVerifier);
        params.code_challenge_method = 'S256';
    }

    if (config.scope) {
        params.scope = config.scope;
    }

    return browserRequest.send({
        url: generateUri(config.authorizationRequestEndpoint, params),
        targetUrl: config.redirectUri,
        incognito: config.incognito,
    });
}

function sendAccessTokenRequest(config, accessTokenRequestParams) {
    const accessTokenRequest = {
        method: config.accessTokenRequestMethod,
        headers: [
            { name: 'Accept', value: 'application/json' },
            {
                name: 'Content-Type',
                value: 'application/x-www-form-urlencoded',
            },
        ],
        stripDefaultHeaders: true,
    };

    if (
        config.accessTokenRequestAuthentication === 'basic' ||
        config.accessTokenRequestAuthentication === 'basic-noencode'
    ) {
        const userName =
            config.accessTokenRequestAuthentication === 'basic'
                ? encodeURI(config.clientId)
                : config.clientId;
        const password =
            config.accessTokenRequestAuthentication === 'basic'
                ? encodeURI(config.clientSecret || '')
                : config.clientSecret || '';
        const token = window.btoa(`${userName}:${password}`);

        accessTokenRequest.headers.push({
            name: 'Authorization',
            value: `Basic ${token}`,
        });
    } else if (config.accessTokenRequestAuthentication === 'body') {
        accessTokenRequestParams.client_id = config.clientId;
        accessTokenRequestParams.client_secret = config.clientSecret || '';
    } else if (config.accessTokenRequestAuthentication === 'pkce') {
        accessTokenRequestParams.client_id = config.clientId;
        accessTokenRequestParams.code_verifier = config.codeVerifier;
    } else {
        accessTokenRequestParams.client_id = config.clientId;
    }

    if (config.accessTokenRequestMethod === 'GET') {
        accessTokenRequest.url = generateUri(
            config.accessTokenRequestEndpoint,
            accessTokenRequestParams,
        );
    } else {
        accessTokenRequest.url = config.accessTokenRequestEndpoint;
        accessTokenRequest.body = encodeQueryString(accessTokenRequestParams);
    }

    return request.send(accessTokenRequest);
}

function validateAuthorizationResponse(response, requiredProperties) {
    // Some authorization servers return the authorization response in the search
    // part of the url and some in the fragment part. So we just check both.

    const url = new URL(response.url);
    const hash = decodeQueryString(url.hash.substr(1));
    const search = decodeQueryString(url.search.substr(1));

    if (requiredProperties.every((p) => hash[p])) {
        return hash;
    } else if (requiredProperties.every((p) => search[p])) {
        return search;
    } else if (hash.error) {
        throw createError(
            `Authorization error: ${hash.error}.`,
            `Description: ${hash.error_description}`,
            `URI: ${hash.error_uri}`,
        );
    } else if (search.error) {
        throw createError(
            `Authorization error: ${search.error}.`,
            `Description: ${search.error_description}`,
            `URI: ${search.error_uri}`,
        );
    } else {
        throw createError(
            'Invalid authorization response.',
            `Got url: ${response.url}`,
            `Expected all of these properties or the property "error" in the query or fragment component: ${requiredProperties.join(
                ', ',
            )}`,
        );
    }
}

function validateAccessTokenResponse(response, validErrorStatuses) {
    const body = tryParseJson(response.body, {});
    if (response.status === 200) {
        if (body.access_token && body.token_type) {
            return body;
        } else {
            throw createError(
                'Invalid access token response.',
                `Got body: ${response.body}`,
                `Expected JSON object with properties: access_token, token_type`,
            );
        }
    } else if (validErrorStatuses.indexOf(response.status) !== -1) {
        if (body.error || body.error_description || body.error_uri) {
            throw createError(
                `Access token error: ${body.error}.`,
                `Description: ${body.error_description}`,
                `URI: ${body.error_uri}`,
            );
        } else {
            throw createError(
                `Unknown access token error.`,
                `Got body: ${response.body}`,
            );
        }
    } else {
        throw createError(
            'Invalid access token response.',
            `Got status: ${response.status}`,
            `Got body: ${response.body}`,
            `Expected status of: 200, ${validErrorStatuses.join(', ')}`,
        );
    }
}

async function executeImplicitFlow(config) {
    const response = await sendAuthorizationRequest(config, 'token');
    const result = validateAuthorizationResponse(response, [
        'access_token',
        'token_type',
    ]);
    return createToken(config, result);
}

async function executeCodeFlow(config) {
    if (config.accessTokenRequestAuthentication === 'pkce') {
        config.codeVerifier = createCodeVerifier();
    }

    const authResponse = await sendAuthorizationRequest(config, 'code');
    const authResult = validateAuthorizationResponse(authResponse, ['code']);
    const accessTokenRequestParams = {
        grant_type: 'authorization_code',
        code: authResult.code,
        redirect_uri: config.redirectUri,
    };

    const response = await sendAccessTokenRequest(
        config,
        accessTokenRequestParams,
    );
    const result = validateAccessTokenResponse(response, [400]);
    return createToken(config, result);
}

async function executeClientCredentialsFlow(config) {
    const accessTokenRequestParams = {
        grant_type: 'client_credentials',
    };

    if (config.scope) {
        accessTokenRequestParams.scope = config.scope;
    }

    const response = await sendAccessTokenRequest(
        config,
        accessTokenRequestParams,
    );
    const result = validateAccessTokenResponse(response, [400, 401]);
    return createToken(config, result);
}

async function executeResourceOwnerPasswordCredentialsFlow(
    config,
    credentials,
) {
    const accessTokenRequestParams = {
        grant_type: 'password',
        username: credentials.username,
        password: credentials.password,
    };

    if (config.scope) {
        accessTokenRequestParams.scope = config.scope;
    }

    const response = await sendAccessTokenRequest(
        config,
        accessTokenRequestParams,
    );
    const result = validateAccessTokenResponse(response, [400, 401]);
    return createToken(config, result);
}

export async function generateToken(config, credentials) {
    config = await prepareConfigWithEnvVariables(config);
    if (config.flow === 'code') {
        return executeCodeFlow(config);
    } else if (config.flow === 'implicit') {
        return executeImplicitFlow(config);
    } else if (config.flow === 'client_credentials') {
        return executeClientCredentialsFlow(config);
    } else if (config.flow === 'resource_owner') {
        return executeResourceOwnerPasswordCredentialsFlow(config, credentials);
    } else {
        throw createError(
            'Invalid flow.',
            `Got: ${config.flow}`,
            `Expected one of: code, implicit, resource_owner`,
        );
    }
}
