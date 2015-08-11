'use strict';

angular.module('app')
    .service('$data', ['$window', '$q', function ($window, $q) {
        var self = this,
            dataChangeListeners = [];
        
        function openDatabase() {
            var dfd = $q.defer(),
                request = $window.indexedDB.open('rester', 1);

            request.onupgradeneeded = function(event) {
                var db = event.target.result;
                db.onerror = function (event) {
                    dfd.reject('Error upgrading database: ' + event.target.errorCode);
                };

                var requestsStore = db.createObjectStore('requests', {keyPath: ['collection', 'title']});
                requestsStore.createIndex('collection', 'collection', {unique: false});

                var historyStore = db.createObjectStore('history', {keyPath: 'time'});
                historyStore.createIndex('request', ['collection', 'name'], {unique: false});
            };

            request.onerror = function(event) {
                dfd.reject('Error opening database: ' + event.target.errorCode);
            };

            request.onsuccess = function(event) {
                dfd.resolve(event.target.result);
            };

            return dfd.promise;
        }

        function createTransaction(db, objectStores, dfd, result) {
            var transaction = db.transaction(objectStores, 'readwrite');

            transaction.oncomplete = function(event) {
                dfd.resolve(result);
            };

            transaction.onerror = function(event) {
                dfd.reject('Error executing transaction: ' + event.target.errorCode);
            };

            return transaction;
        }

        function fireChangeListeners() {
            dataChangeListeners.forEach(l => { l(); });
        }

        function readAllValuesIntoArray(cursorRequest, dfd, result) {
            cursorRequest.onsuccess = function(event) {
                var cursor = event.target.result;
                if (cursor) {
                    result.push(cursor.value);
                    cursor.continue();
                }
            };

            cursorRequest.onerror = function(event) {
                dfd.reject('Error executing request: ' + event.target.errorCode);
            };
        }

        function readAllKeysIntoArray(cursorRequest, dfd, result) {
            cursorRequest.onsuccess = function(event) {
                var cursor = event.target.result;
                if (cursor) {
                    result.push(cursor.key);
                    cursor.continue();
                }
            };

            cursorRequest.onerror = function(event) {
                dfd.reject('Error executing request: ' + event.target.errorCode);
            };
        }

        self.addChangeListener = function (listener) {
            dataChangeListeners.push(listener);
        };

        self.getRequest = function (collection, title) {
            return openDatabase().then(db => {
                var dfd = $q.defer(),
                    request = {},
                    transaction = createTransaction(db, ['requests'], dfd, request),
                    objectStore = transaction.objectStore('requests');

                objectStore.get([collection, title]).onsuccess = function (event) {
                    Object.assign(request, event.target.result);
                };

                return dfd.promise;
            });
        };

        self.getRequests = function () {
            return openDatabase().then(db => {
                var dfd = $q.defer(),
                    requests = [],
                    transaction = createTransaction(db, ['requests'], dfd, requests),
                    objectStore = transaction.objectStore('requests');

                readAllValuesIntoArray(objectStore.openCursor(), dfd, requests);

                return dfd.promise;
            });
        };

        self.getRequestCollections = function () {
            return openDatabase().then(db => {
                var dfd = $q.defer(),
                    collections = [],
                    transaction = createTransaction(db, ['requests'], dfd, collections),
                    objectStore = transaction.objectStore('requests'),
                    index = objectStore.index('collection');

                readAllKeysIntoArray(index.openKeyCursor(null, 'nextunique'), dfd, collections);

                return dfd.promise;
            });
        };

        self.putRequest = function (request) {
            return openDatabase().then(db => {
                var dfd = $q.defer(),
                    transaction = createTransaction(db, ['requests'], dfd),
                    objectStore = transaction.objectStore('requests');
                
                objectStore.put(request);

                dfd.promise.then(fireChangeListeners);

                return dfd.promise;
            });
        };

    }]);
