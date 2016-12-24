(function () {

    window.rester = window.rester || {};
    rester.data = rester.data || {};
    rester.data.utils = rester.data.utils || {};
    rester.data.utils.db = {};


    let dbInstance = null;

    function open() {
        if (dbInstance) {
            return Promise.resolve(dbInstance);
        }

        return new Promise((resolve, reject) => {
            const request = indexedDB.open('rester', 3);

            request.onupgradeneeded = function (event) {
                const db = event.target.result;

                let requestsStore,
                    historyStore,
                    authProviderConfigsStore,
                    authTokensStore,
                    environmentsStore;

                db.onerror = function (event) {
                    reject('Error upgrading database: ' + event.target.errorCode);
                };

                if (event.oldVersion < 1) {
                    requestsStore = db.createObjectStore('requests', {keyPath: 'id', autoIncrement: true});
                    requestsStore.createIndex('collection', 'collection', {unique: false});

                    historyStore = db.createObjectStore('history', {keyPath: 'id', autoIncrement: true});
                }

                if (event.oldVersion < 2) {
                    authProviderConfigsStore = db.createObjectStore('authProviderConfigs', {keyPath: 'id', autoIncrement: true});
                    authProviderConfigsStore.createIndex('providerId', 'providerId', {unique: false});

                    authTokensStore = db.createObjectStore('authTokens', {keyPath: 'id', autoIncrement: true});
                }

                if (event.oldVersion < 3) {
                    environmentsStore = db.createObjectStore('environments', {keyPath: 'id', autoIncrement: true});
                }
            };

            request.onerror = function (event) {
                reject('Error opening database: ' + event.target.errorCode);
            };

            request.onsuccess = function (event) {
                dbInstance = event.target.result;
                resolve(dbInstance);
            };
        });
    }

    function addTransactionChange(transaction, action, item) {
        transaction.changes.push({
            action,
            item,
            itemType: item.constructor.name
        });
    }

    rester.data.utils.db.transaction = function (objectStoreNames, transactionMode, transactionContentCallback) {
        return open().then(db => {
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(objectStoreNames, transactionMode),
                      objectStores = objectStoreNames.map(name => transaction.objectStore(name));

                let result;

                transaction.oncomplete = function () {
                    if (transaction.changes.length > 0) {
                        rester.data.onChange.emit(transaction.changes);
                    }

                    resolve(result);
                };

                transaction.onerror = function (event) {
                    reject('Error executing transaction: ' + event.target.errorCode);
                };

                transaction.changes = [];

                try {
                    result = transactionContentCallback(objectStores);
                } catch (error) {
                    transaction.abort();
                    reject('Transaction was aborted because of unexpected error: ' + error.message);
                }
            });
        });
    };

    rester.data.utils.db.addEntityAndUpdateId = function (objectStore, entity) {
        return new Promise(resolve => {
            objectStore.add(entity).onsuccess = function (event) {
                entity.id = event.target.result;
                addTransactionChange(objectStore.transaction, 'add', entity);
                resolve(entity.id);
            };
        });
    };

    rester.data.utils.db.putEntityAndUpdateId = function (objectStore, entity) {
        return new Promise(resolve => {
            objectStore.put(entity).onsuccess = function (event) {
                entity.id = event.target.result;
                addTransactionChange(objectStore.transaction, 'put', entity);
                resolve(entity.id);
            };
        });
    };

    rester.data.utils.db.deleteEntity = function (objectStore, entity) {
        return new Promise(resolve => {
            objectStore.delete(entity.id).onsuccess = function () {
                addTransactionChange(objectStore.transaction, 'delete', entity);
                resolve();
            };
        });
    };

    rester.data.utils.db.getEntity = function(objectStore, id, ObjectConstructor) {
        return new Promise(resolve => {
            objectStore.get(id).onsuccess = function (event) {
                resolve(new ObjectConstructor(event.target.result));
            };
        });
    };

    rester.data.utils.db.getAllEntities = function (objectStoreOrIndex, range, ObjectConstructor, maxItems) {
        return new Promise((resolve, reject) => {
            const cursorRequest = objectStoreOrIndex.openCursor(range, +maxItems < 0 ? 'prev' : 'next'),
                  result = [];

            cursorRequest.onsuccess = function (event) {
                let cursor = event.target.result;
                if (cursor && (!maxItems || result.length < Math.abs(maxItems))) {
                    result.push(new ObjectConstructor(cursor.value));
                    cursor.continue();
                } else {
                    resolve(result);
                }
            };

            cursorRequest.onerror = function (event) {
                reject('Error executing request: ' + event.target.errorCode);
            };
        });
    };

    rester.data.utils.db.getAllUniqueKeys = function (objectStoreOrIndex) {
        return new Promise((resolve, reject) => {
            const cursorRequest = objectStoreOrIndex.openKeyCursor(null, 'nextunique'),
                  result = [];

            cursorRequest.onsuccess = function (event) {
                let cursor = event.target.result;
                if (cursor) {
                    result.push(cursor.key);
                    cursor.continue();
                } else {
                    resolve(result);
                }
            };

            cursorRequest.onerror = function (event) {
                reject('Error executing request: ' + event.target.errorCode);
            };
        });
    };

})();
