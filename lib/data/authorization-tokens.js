'use strict';

const db = require('lib/data/utils/db');


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
 * @property {Number} providerId - The id of the token provider, which
 * generated this token.
 */
exports.AuthorizationToken = AuthorizationToken;
function AuthorizationToken(dbObject) {
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

exports.add = function (token) {
    token = new AuthorizationToken(token);
    return db.transaction(['authTokens'], (transaction, objectStores) => {
        return db.addEntityAndUpdateId(objectStores[0], token);
    });
};

exports.query = function () {
    return db.transaction(['authTokens'], (transaction, objectStores) => {
        return db.getAllEntities(objectStores[0], null, AuthorizationToken);
    });
};

exports.delete = function (token) {
    token = new AuthorizationToken(token);
    return db.transaction(['authTokens'], (transaction, objectStores) => {
        return db.deleteEntity(objectStores[0], token);
    });
};
