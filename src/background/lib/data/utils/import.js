(function () {
    'use strict';

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
        const tableNames = Object.keys(data);
        const transaction = db.transaction();

        tableNames.forEach(tableName => {
            const entities = data[tableName];
            const EntityConstructor = entityConstructors[tableName];

            for (let rawEntity of entities) {
                const entity = new EntityConstructor(rawEntity);
                transaction.add(tableName, entity);
            }
        });

        return transaction.execute();
    };
})();
