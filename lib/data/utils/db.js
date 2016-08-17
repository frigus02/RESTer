'use strict';

const { indexedDB } = require('sdk/indexed-db'),
      { defer } = require('sdk/core/promise'),
      { wrapFireChangeListenersForThen } = require('lib/data/utils/events');

let dbInstance = null;


function open() {
    if (dbInstance) {
        return Promise.resolve(dbInstance);
    }

    const dfd = defer(),
          request = indexedDB.open('rester', 3);

    request.onupgradeneeded = function (event) {
        let db = event.target.result,
            requestsStore,
            historyStore,
            authProviderConfigsStore,
            authTokensStore,
            environmentsStore;

        db.onerror = function (event) {
            dfd.reject('Error upgrading database: ' + event.target.errorCode);
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
        dfd.reject('Error opening database: ' + event.target.errorCode);
    };

    request.onsuccess = function (event) {
        dbInstance = event.target.result;
        dfd.resolve(dbInstance);
    };

    return dfd.promise;
}

exports.transaction = function (objectStoreNames, transactionContentCallback) {
    return open().then(db => {
        let dfd = defer(),
            transaction = db.transaction(objectStoreNames, 'readwrite'),
            objectStores = objectStoreNames.map(name => transaction.objectStore(name)),
            result;

        transaction.oncomplete = function () {
            dfd.resolve(result);
        };

        transaction.onerror = function (event) {
            dfd.reject('Error executing transaction: ' + event.target.errorCode);
        };

        result = transactionContentCallback(transaction, objectStores);

        return dfd.promise;
    });
};

exports.addEntityAndUpdateId = function (objectStore, entity) {
    let dfd = defer();

    objectStore.add(entity).onsuccess = function (event) {
        entity.id = event.target.result;

        dfd.resolve(entity.id);
    };

    dfd.promise.then(wrapFireChangeListenersForThen('add', entity));
    return dfd.promise;
};

exports.deleteEntity = function (objectStore, entity) {
    let dfd = defer();

    objectStore.delete(entity.id).onsuccess = function () {
        dfd.resolve();
    };

    dfd.promise.then(wrapFireChangeListenersForThen('delete', entity));
    return dfd.promise;
};

exports.getEntity = function(objectStore, id, ObjectConstructor) {
    let dfd = defer();

    objectStore.get(id).onsuccess = function (event) {
        dfd.resolve(new ObjectConstructor(event.target.result));
    };

    return dfd.promise;
};

exports.getAllEntities = function (objectStoreOrIndex, range, ObjectConstructor, maxItems) {
    let dfd = defer(),
        cursorRequest = objectStoreOrIndex.openCursor(range, +maxItems < 0 ? 'prev' : 'next'),
        result = [];

    cursorRequest.onsuccess = function (event) {
        let cursor = event.target.result;
        if (cursor && (!maxItems || result.length < Math.abs(maxItems))) {
            result.push(new ObjectConstructor(cursor.value));
            cursor.continue();
        } else {
            dfd.resolve(result);
        }
    };

    cursorRequest.onerror = function (event) {
        dfd.reject('Error executing request: ' + event.target.errorCode);
    };

    return dfd.promise;
};

exports.getAllUniqueKeys = function (objectStoreOrIndex) {
    let dfd = defer(),
        cursorRequest = objectStoreOrIndex.openKeyCursor(null, 'nextunique'),
        result = [];

    cursorRequest.onsuccess = function (event) {
        let cursor = event.target.result;
        if (cursor) {
            result.push(cursor.key);
            cursor.continue();
        } else {
            dfd.resolve(result);
        }
    };

    cursorRequest.onerror = function (event) {
        dfd.reject('Error executing request: ' + event.target.errorCode);
    };

    return dfd.promise;
};

exports.putEntityAndUpdateId = function (objectStore, entity) {
    let dfd = defer();

    objectStore.put(entity).onsuccess = function (event) {
        entity.id = event.target.result;

        dfd.resolve(entity.id);
    };

    dfd.promise.then(wrapFireChangeListenersForThen('put', entity));
    return dfd.promise;
};
