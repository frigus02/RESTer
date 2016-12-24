(function () {

    window.rester = window.rester || {};
    rester.data = rester.data || {};
    rester.data.utils = rester.data.utils || {};


    const entityConstructors = {
        requests: rester.data.requests.Request,
        history: rester.data.history.HistoryEntry,
        authProviderConfigs: rester.data.authorizationProviderConfigurations.AuthorizationProviderConfiguration,
        authTokens: rester.data.authorizationTokens.AuthorizationToken,
        environments: rester.data.environments.Environment
    };
    const db = rester.data.utils.db;

    rester.data.utils.import = function (data) {
        const objectStoreNames = Object.keys(data);

        return db.transaction(objectStoreNames, 'readwrite', objectStores => {
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

})();
