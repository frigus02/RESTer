'use strict';

const db = require('lib/data/utils/db'),
      { AuthorizationProviderConfiguration } = require('lib/data/authorization-provider-configurations'),
      { AuthorizationToken } = require('lib/data/authorization-tokens'),
      { Environment } = require('lib/data/environments'),
      { HistoryEntry } = require('lib/data/history'),
      { Request } = require('lib/data/requests');

const entityConstructors = {
    requests: Request,
    history: HistoryEntry,
    authProviderConfigs: AuthorizationProviderConfiguration,
    authTokens: AuthorizationToken,
    environments: Environment
};

module.exports = function (data) {
    const objectStoreNames = Object.keys(data);

    return db.transaction(objectStoreNames, (transaction, objectStores) => {
        const operations = [];

        objectStoreNames.forEach((objectStoreName, i) => {
            const entities = data[objectStoreName],
                  EntityConstructor = entityConstructors[objectStoreName],
                  objectStore = objectStores[i];

            for (let rawEntity of entities) {
                const entity = new EntityConstructor(rawEntity);
                operations.push(db.addEntityAndUpdateId(objectStore, entity));
            }
        });

        return Promise.all(operations);
    });
};
