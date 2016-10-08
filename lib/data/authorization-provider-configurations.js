'use strict';

const { IDBKeyRange } = require('sdk/indexed-db'),
      db = require('lib/data/utils/db');


/**
 * @typedef AuthorizationProviderConfiguration
 * @type {Object}
 * @property {Number} id - Unique id of the provider config.
 * @property {String} title - Display name of the provider configuration.
 * @property {Number} providerId - The id of the token provider, this
 * configuration belongs to.
 */
exports.AuthorizationProviderConfiguration = AuthorizationProviderConfiguration;
function AuthorizationProviderConfiguration(dbObject) {
    if (dbObject) {
        Object.assign(this, dbObject);
    } else {
        this.title = '';
        this.providerId = 0;
    }
}

exports.put = function (config) {
    config = new AuthorizationProviderConfiguration(config);
    return db.transaction(['authProviderConfigs'], 'readwrite', objectStores => {
        return db.putEntityAndUpdateId(objectStores[0], config);
    });
};

exports.query = function (providerId) {
    return db.transaction(['authProviderConfigs'], 'readonly', objectStores => {
        let index = objectStores[0].index('providerId');
        return db.getAllEntities(index, IDBKeyRange.only(providerId), AuthorizationProviderConfiguration);
    });
};

exports.delete = function (id) {
    const config = new AuthorizationProviderConfiguration();
    config.id = id;

    return db.transaction(['authProviderConfigs'], 'readwrite', objectStores => {
        return db.deleteEntity(objectStores[0], config);
    });
};
