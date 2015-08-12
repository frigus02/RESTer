'use strict';

angular.module('app')
    .service('$data', ['$window', '$q', function ($window, $q) {
        var self = this,
            dataChangeListeners = [];
        
        // -------------------------------------------------------
        // IDB helpers
        // -------------------------------------------------------

        function openDatabase() {
            var dfd = $q.defer(),
                request = $window.indexedDB.open('rester', 1);

            request.onupgradeneeded = function(event) {
                var db = event.target.result;
                db.onerror = function (event) {
                    dfd.reject('Error upgrading database: ' + event.target.errorCode);
                };

                var requestsStore = db.createObjectStore('requests', {keyPath: 'id', autoIncrement: true});
                requestsStore.createIndex('collection', 'collection', {unique: false});

                var historyStore = db.createObjectStore('history', {keyPath: 'id', autoIncrement: true});
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
                if (typeof result === 'function') {
                    result = result();
                }

                dfd.resolve(result);
            };

            transaction.onerror = function(event) {
                dfd.reject('Error executing transaction: ' + event.target.errorCode);
            };

            return transaction;
        }

        function readAllEntriesIntoArray(cursorRequest, dfd, result, valueGetter, maxItems) {
            if (!valueGetter) {
                valueGetter = c => c.value;
            }

            cursorRequest.onsuccess = function(event) {
                var cursor = event.target.result;
                if (cursor && (!maxItems || result.length < maxItems)) {
                    result.push(valueGetter(cursor));
                    cursor.continue();
                }
            };

            cursorRequest.onerror = function(event) {
                dfd.reject('Error executing request: ' + event.target.errorCode);
            };
        }


        // -------------------------------------------------------
        // Change listeners
        // -------------------------------------------------------

        self.addChangeListener = function (listener) {
            dataChangeListeners.push(listener);
        };

        function fireChangeListeners(changes) {
            dataChangeListeners.forEach(l => { l(changes); });
        }

        function wrapFireChangeListenersForThen(action, item) {
            return function () {
                fireChangeListeners([{
                    'action': action,
                    'item': item
                }]);
            };
        }


        // -------------------------------------------------------
        // Requests
        // -------------------------------------------------------

        /**
         * @typedef $data~Request
         * @type {Object}
         * @property {Number} id - The id of the request.
         * @property {String} collection - The collection name of the request.
         * @property {String} title - THe request title.
         * @property {String} method - The HTTP method name (GET, POST, ...).
         * @property {String} url - The url.
         * @property {Object} headers - The request headers as key value pairs.
         * @property {String} body - The request body as string.
         */
        self.Request = function () {
            //this.id = 0;
            this.collection = null;
            this.title = null;
            this.method = null;
            this.url = null;
            this.headers = {};
            this.body = null;
        };

        /**
         * Adds a new request to the database or updates an existing one with the
         * same collection and title.
         * @param {$data~Request} request - The request to save in database.
         * @returns {Promise.<Number>} A promise which gets resolved, when the request
         * was successfully saved and returns the new request id.
         */
        self.putRequest = function (request) {
            return openDatabase().then(db => {
                var dfd = $q.defer(),
                    transaction = createTransaction(db, ['requests'], dfd, () => request.id),
                    objectStore = transaction.objectStore('requests');
                
                objectStore.put(request).onsuccess = function (event) {
                    request.id = event.target.result;
                };

                dfd.promise.then(wrapFireChangeListenersForThen('put', request));

                return dfd.promise;
            });
        };

        /**
         * Return the full request object for the specified key.
         * @param {Number} id - The id of the request.
         * @returns {Promise.<$data~Request>} A promise which returns a the full request
         * object when resolved.
         */
        self.getRequest = function (id) {
            return openDatabase().then(db => {
                var dfd = $q.defer(),
                    request = new self.Request(),
                    transaction = createTransaction(db, ['requests'], dfd, request),
                    objectStore = transaction.objectStore('requests');

                objectStore.get(+id).onsuccess = function (event) {
                    Object.assign(request, event.target.result);
                };

                return dfd.promise;
            });
        };

        /**
         * Returns all requests.
         * @returns {Promise.<Array<$data~Request>>} A promise which returns a list of
         * requests when resolved.
         */
        self.getRequests = function () {
            return openDatabase().then(db => {
                var dfd = $q.defer(),
                    requests = [],
                    transaction = createTransaction(db, ['requests'], dfd, requests),
                    objectStore = transaction.objectStore('requests');

                readAllEntriesIntoArray(objectStore.openCursor(), dfd, requests, c => {
                    return Object.assign(new self.Request(), c.value);
                });

                return dfd.promise;
            });
        };

        /**
         * Returns all collections, that were used in any request.
         * @returns {Promise.<Array<String>>} A promise which returns a list of
         * all used collections.
         */
        self.getRequestCollections = function () {
            return openDatabase().then(db => {
                var dfd = $q.defer(),
                    collections = [],
                    transaction = createTransaction(db, ['requests'], dfd, collections),
                    objectStore = transaction.objectStore('requests'),
                    index = objectStore.index('collection');

                readAllEntriesIntoArray(index.openKeyCursor(null, 'nextunique'), dfd, collections, c => c.key);

                return dfd.promise;
            });
        };

        /**
         * Deletes an existing request from the database.
         * @param {$data~Request} request - The request to be deleted.
         * @returns {Promise} A promise which gets resolved, when the request was
         * successfully deleted.
         */
        self.deleteRequest = function (request) {
            return openDatabase().then(db => {
                var dfd = $q.defer(),
                    transaction = createTransaction(db, ['requests'], dfd),
                    objectStore = transaction.objectStore('requests');
                
                objectStore.delete(request.id);

                dfd.promise.then(wrapFireChangeListenersForThen('delete', request));

                return dfd.promise;
            });
        };


        // -------------------------------------------------------
        // Responses
        // -------------------------------------------------------

        /**
         * @typedef $data~Response
         * @type {Object}
         * @property {Number} status - The HTTP status code.
         * @property {String} statusText - The status text.
         * @property {Object} headers - The response headers as key value pairs.
         * @property {String} body - The response body as string.
         */
        self.Response = function () {
            this.status = 0;
            this.statusText = null;
            this.headers = {};
            this.body = null;
        };

        self.Response.prototype = {
            getHeadersAsString: function () {
                return _(this.headers)
                    .pairs()
                    .sortBy(0)
                    .map(h => `${h[0]}: ${h[1]}`)
                    .value()
                    .join('\n');
            }
        };


        // -------------------------------------------------------
        // History
        // -------------------------------------------------------

        /**
         * @typedef $data~HistoryEntry
         * @type {Object}
         * @property {Number} id - The id of the history entry.
         * @property {Date} time - The time at which the request has been executed.
         * @property {$data~Request} request - The executed request.
         * @property {$data~Response} response - The response.
         */
        self.HistoryEntry = function (props) {
            //this.id = 0;
            this.time = 0;
            this.request = null;
            this.response = null;
        };

        /**
         * Adds a new history entry to the database. If this entry is not unique
         * an exception is thrown.
         * @param {$data~HistoryEntry} entry - The new history entry.
         * @returns {Promise.<Number>} A promise, which gets resolved, when the entry
         * was successfully saved and returns the new history entry íd.
         */
        self.addHistoryEntry = function (entry) {
            return openDatabase().then(db => {
                var dfd = $q.defer(),
                    transaction = createTransaction(db, ['history'], dfd, () => entry.id),
                    objectStore = transaction.objectStore('history');
                
                objectStore.add(entry).onsuccess = function (event) {
                    entry.id = event.target.result;
                };

                dfd.promise.then(wrapFireChangeListenersForThen('add', entry));

                return dfd.promise;
            });
        };

        /**
         * Return the full history entry object for the specified key.
         * @param {Number} id - The id of the history entry.
         * @returns {Promise.<$data~HistoryEntry>} A promise which returns a the
         * full history entry object when resolved.
         */
        self.getHistoryEntry = function (id) {
            return openDatabase().then(db => {
                var dfd = $q.defer(),
                    entry = new self.HistoryEntry(),
                    transaction = createTransaction(db, ['history'], dfd, entry),
                    objectStore = transaction.objectStore('history');

                objectStore.get(+id).onsuccess = function (event) {
                    Object.assign(entry, event.target.result);
                    entry.request = Object.assign(new self.Request(), entry.request);
                    entry.response = Object.assign(new self.Response(), entry.response);
                };

                return dfd.promise;
            });
        };

        /**
         * Returns all history entries, including only a subset of all properties.
         * @param {Number=0} top - When specified, the method only returns this amount
         * of newest items.
         * @returns {Promise.<Array<$data~HistoryEntry>>} A promise which returns
         * a list of history entries when resolved.
         */
        self.getHistoryEntries = function (top) {
            return openDatabase().then(db => {
                var dfd = $q.defer(),
                    historyEntries = [],
                    transaction = createTransaction(db, ['history'], dfd, historyEntries),
                    objectStore = transaction.objectStore('history');

                readAllEntriesIntoArray(objectStore.openCursor(null, 'prev'), dfd, historyEntries, c => {
                    var entry = Object.assign(new self.HistoryEntry(), c.value);
                    entry.request = Object.assign(new self.Request(), entry.request);
                    entry.response = Object.assign(new self.Response(), entry.response);
                    return entry;
                }, top);

                return dfd.promise;
            });
        };

        /**
         * Deletes an existing history entry from the database.
         * @param {$data~HistoryEntry} entry - The history entry to be deleted.
         * @returns {Promise} A promise which gets resolved, when the entry was
         * successfully deleted.
         */
        self.deleteHistoryEntry = function (entry) {
            return openDatabase().then(db => {
                var dfd = $q.defer(),
                    transaction = createTransaction(db, ['history'], dfd),
                    objectStore = transaction.objectStore('history');
                
                objectStore.delete(entry.id);

                dfd.promise.then(wrapFireChangeListenersForThen('delete', entry));

                return dfd.promise;
            });
        };

    }]);
