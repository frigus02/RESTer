'use strict';

const { indexedDB } = require('sdk/indexed-db');

exports.get = function () {
    return openDatabase().then(
        db => getAllEntitiesFromDatabase(db),
        () => ({}));
};

exports.delete = function () {
    indexedDB.deleteDatabase('rester');
};

function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('rester');

        request.onerror = function () {
            reject();
        };

        request.onsuccess = function (event) {
            const db = event.target.result;
            if (db.objectStoreNames.length > 0) {
                resolve(db);
            } else {
                reject();
            }
        };
    });
}

function getAllEntitiesFromDatabase(db) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(db.objectStoreNames, 'readonly');
        const entities = {};

        transaction.oncomplete = function () {
            resolve(entities);
        };

        transaction.onerror = function (event) {
            reject('Error executing transaction: ' + event.target.errorCode);
        };

        for (let name of db.objectStoreNames) {
            const objectStore = transaction.objectStore(name);
            entities[name] = getAllEntitiesFromObjectStore(objectStore);
        }
    });
}

function getAllEntitiesFromObjectStore(objectStore) {
    const cursorRequest = objectStore.openCursor();
    const result = [];

    cursorRequest.onsuccess = function (event) {
        const cursor = event.target.result;
        if (cursor) {
            result.push(cursor.value);
            cursor.continue();
        }
    };

    return result;
}
