import db from './utils/db.js';

/**
 * @typedef AuthorizationToken
 * @type {Object}
 * @property {Number} id - Unique id of the token.
 * @property {String} title - A human readable display name for the token.
 * @property {String} scheme - The authorization scheme like "Basic" or
 * "Bearer" as defined in https://tools.ietf.org/html/rfc2617.
 * @property {String} token - The actual access token.
 * @property {Date} expirationDate - An optional expiration date. The token
 * will automatically be removed from database, when it is expired.
 * @property {Number} configurationId - If the token was created from a
 * authorization provider configuration, the property will be its id.
 * @property {Number} providerId - The id of the token provider, which
 * generated this token.
 */
export class AuthorizationToken {
    constructor(dbObject) {
        if (dbObject) {
            Object.assign(this, dbObject);
        } else {
            this.title = '';
            this.scheme = '';
            this.token = '';
            this.expirationDate = null;
            this.configurationId = 0;
            this.providerId = 0;
        }
    }
}

export function addAuthorizationToken(token) {
    token = new AuthorizationToken(token);
    return db.transaction().add('authTokens', token).execute();
}

export function queryAuthorizationTokens() {
    return db.query('authTokens', AuthorizationToken);
}

export function deleteAuthorizationToken(id) {
    const token = new AuthorizationToken({ id });
    return db.transaction().delete('authTokens', token).execute();
}
