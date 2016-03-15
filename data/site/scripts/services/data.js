'use strict';

angular.module('app')
    .service('$data', ['$window', '$q', function ($window, $q) {
        let self = this,
            dataChangeListeners = [];

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
         * @property {Array} headers - The request headers as an array oj objects.
         * Each object has the properties `name` and `value`.
         * @property {String} body - The request body as string.
         * @property {Object} variables - Configuration of replacement variables,
         * which are applied when sending the request.
         * @property {Boolean} variables.enabled - Whether replacement variables
         * are enabled for this request.
         * @property {Object} variables.values - The replacement values. This will
         * never be stored when saving requests. It is however available in the
         * history of completed requests.
         */
        self.Request = function (dbObject) {
            if (dbObject) {
                Object.assign(this, dbObject);
                this.headers = migrateHeadersObjectToArray(this.headers);
                self.variables = migrateVariablesObject(this.variables);
            } else {
                this.collection = null;
                this.title = null;
                this.method = null;
                this.url = null;
                this.headers = [];
                this.body = null;
                this.variables = {enabled: false};
            }
        };

        /**
         * Adds a new request to the database or updates an existing one with the
         * same collection and title.
         *
         * @param {$data~Request} request - The request to save in database.
         * @returns {Promise.<Number>} A promise which gets resolved, when the request
         * was successfully saved and returns the new request id.
         */
        self.putRequest = function (request) {
            if (request.variables && 'values' in request.variables) {
                request = _.cloneDeep(request);
                delete request.variables.values;
            }

            return openDatabase().then(db => {
                return createTransaction(db, ['requests'], function (transaction, objectStores) {
                    return putEntityAndUpdateId(objectStores[0], request);
                });
            });
        };

        /**
         * Return the full request object for the specified key.
         *
         * @param {Number} id - The id of the request.
         * @returns {Promise.<$data~Request>} A promise which returns a the full request
         * object when resolved.
         */
        self.getRequest = function (id) {
            return openDatabase().then(db => {
                return createTransaction(db, ['requests'], function (transaction, objectStores) {
                    return getEntity(objectStores[0], id, self.Request);
                });
            });
        };

        /**
         * Returns all requests.
         *
         * @returns {Promise.<Array<$data~Request>>} A promise which returns a list of
         * requests when resolved.
         */
        self.getRequests = function () {
            return openDatabase().then(db => {
                return createTransaction(db, ['requests'], function (transaction, objectStores) {
                    return getAllEntities(objectStores[0], null, self.Request);
                });
            });
        };

        /**
         * Returns all collections, that were used in any request.
         *
         * @returns {Promise.<Array<String>>} A promise which returns a list of
         * all used collections.
         */
        self.getRequestCollections = function () {
            return openDatabase().then(db => {
                return createTransaction(db, ['requests'], function (transaction, objectStores) {
                    let index = objectStores[0].index('collection');
                    return getAllUniqueKeys(index);
                });
            });
        };

        /**
         * Deletes an existing request from the database.
         *
         * @param {$data~Request} request - The request to be deleted.
         * @returns {Promise} A promise which gets resolved, when the request was
         * successfully deleted.
         */
        self.deleteRequest = function (request) {
            return openDatabase().then(db => {
                return createTransaction(db, ['requests'], function (transaction, objectStores) {
                    return deleteEntity(objectStores[0], request);
                });
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
         * @property {Array} headers - The response headers as an array oj objects.
         * Each object has the properties `name` and `value`.
         * @property {String} body - The response body as string.
         */
        self.Response = function (dbObject) {
            if (dbObject) {
                Object.assign(this, dbObject);
                this.headers = migrateHeadersObjectToArray(this.headers);
            } else {
                this.status = 0;
                this.statusText = null;
                this.headers = [];
                this.body = null;
            }
        };

        self.Response.prototype = {
            getHeadersAsString: function () {
                return _(this.headers)
                    .sortBy('name')
                    .map(h => `${h.name}: ${h.value}`)
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
        self.HistoryEntry = function (dbObject) {
            if (dbObject) {
                this.id = dbObject.id;
                this.time = dbObject.time;
                this.request = new self.Request(dbObject.request);
                this.response = new self.Response(dbObject.response);
            } else {
                this.time = 0;
                this.request = null;
                this.response = null;
            }
        };

        /**
         * Adds a new history entry to the database. If this entry is not unique
         * an exception is thrown.
         *
         * @param {$data~HistoryEntry} entry - The new history entry.
         * @returns {Promise.<Number>} A promise, which gets resolved, when the entry
         * was successfully saved and returns the new history entry íd.
         */
        self.addHistoryEntry = function (entry) {
            return openDatabase().then(db => {
                return createTransaction(db, ['history'], function (transaction, objectStores) {
                    return addEntityAndUpdateId(objectStores[0], entry);
                });
            });
        };

        /**
         * Return the full history entry object for the specified key.
         *
         * @param {Number} id - The id of the history entry.
         * @returns {Promise.<$data~HistoryEntry>} A promise which returns a the
         * full history entry object when resolved.
         */
        self.getHistoryEntry = function (id) {
            return openDatabase().then(db => {
                return createTransaction(db, ['history'], function (transaction, objectStores) {
                    return getEntity(objectStores[0], id, self.HistoryEntry);
                });
            });
        };

        /**
         * Returns all history entries, including only a subset of all properties.
         *
         * @param {Number=0} top - When specified, the method only returns this amount
         * of newest items.
         * @returns {Promise.<Array<$data~HistoryEntry>>} A promise which returns
         * a list of history entries when resolved.
         */
        self.getHistoryEntries = function (top) {
            return openDatabase().then(db => {
                return createTransaction(db, ['history'], function (transaction, objectStores) {
                    return getAllEntities(objectStores[0], null, self.HistoryEntry, top);
                });
            });
        };

        /**
         * Deletes an existing history entry from the database.
         *
         * @param {$data~HistoryEntry} entry - The history entry to be deleted.
         * @returns {Promise} A promise which gets resolved, when the entry was
         * successfully deleted.
         */
        self.deleteHistoryEntry = function (entry) {
            return openDatabase().then(db => {
                return createTransaction(db, ['history'], function (transaction, objectStores) {
                    return deleteEntity(objectStores[0], entry);
                });
            });
        };


        // -------------------------------------------------------
        // Authorization Token Provider Configuration
        // -------------------------------------------------------

        /**
         * @typedef $data~AuthorizationProviderConfiguration
         * @type {Object}
         * @property {Number} id - Unique id of the provider config.
         * @property {String} title - Display name of the provider configuration.
         * @property {Number} providerId - The id of the token provider, this
         * configuration belongs to.
         */
        self.AuthorizationProviderConfiguration = function (dbObject) {
            if (dbObject) {
                Object.assign(this, dbObject);
            } else {
                this.title = '';
                this.providerId = 0;
            }
        };

        self.putAuthorizationProviderConfiguration = function (config) {
            return openDatabase().then(db => {
                return createTransaction(db, ['authProviderConfigs'], function (transaction, objectStores) {
                    return putEntityAndUpdateId(objectStores[0], config);
                });
            });
        };

        self.getAuthorizationProviderConfigurations = function (providerId) {
            return openDatabase().then(db => {
                return createTransaction(db, ['authProviderConfigs'], function (transaction, objectStores) {
                    let index = objectStores[0].index('providerId');
                    return getAllEntities(index, $window.IDBKeyRange.only(providerId), self.AuthorizationProviderConfiguration);
                });
            });
        };

        self.deleteAuthorizationProviderConfiguration = function (config) {
            return openDatabase().then(db => {
                return createTransaction(db, ['authProviderConfigs'], function (transaction, objectStores) {
                    return deleteEntity(objectStores[0], config);
                });
            });
        };


        // -------------------------------------------------------
        // Authorization Token
        // -------------------------------------------------------

        /**
         * @typedef $data~AuthorizationToken
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
        self.AuthorizationToken = function (dbObject) {
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
        };

        self.addAuthorizationToken = function (token) {
            return openDatabase().then(db => {
                return createTransaction(db, ['authTokens'], function (transaction, objectStores) {
                    return addEntityAndUpdateId(objectStores[0], token);
                });
            });
        };

        self.getAuthorizationTokens = function () {
            return openDatabase().then(db => {
                return createTransaction(db, ['authTokens'], function (transaction, objectStores) {
                    return getAllEntities(objectStores[0], null, self.AuthorizationToken);
                });
            });
        };

        self.deleteAuthorizationToken = function (token) {
            return openDatabase().then(db => {
                return createTransaction(db, ['authTokens'], function (transaction, objectStores) {
                    return deleteEntity(objectStores[0], token);
                });
            });
        };


        // -------------------------------------------------------
        // Change listeners
        // -------------------------------------------------------

        self.addChangeListener = function (listener) {
            dataChangeListeners.push(listener);
        };

        function fireChangeListeners(changes) {
            dataChangeListeners.forEach(l => {
                l(changes);
            });
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
        // IDB helpers
        // -------------------------------------------------------

        function openDatabase() {
            let dfd = $q.defer(),
                request = $window.indexedDB.open('rester', 2);

            request.onupgradeneeded = function (event) {
                let db = event.target.result,
                    requestsStore,
                    historyStore,
                    authProviderConfigsStore,
                    authTokensStore;

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
            };

            request.onerror = function (event) {
                dfd.reject('Error opening database: ' + event.target.errorCode);
            };

            request.onsuccess = function (event) {
                dfd.resolve(event.target.result);
            };

            return dfd.promise;
        }

        function createTransaction(db, objectStoreNames, transactionContentCallback) {
            let dfd = $q.defer(),
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
        }

        function addEntityAndUpdateId(objectStore, entity) {
            let dfd = $q.defer();

            objectStore.add(entity).onsuccess = function (event) {
                entity.id = event.target.result;

                dfd.resolve(entity.id);
            };

            dfd.promise.then(wrapFireChangeListenersForThen('add', entity));
            return dfd.promise;
        }

        function deleteEntity(objectStore, entity) {
            let dfd = $q.defer();

            objectStore.delete(entity.id).onsuccess = function () {
                dfd.resolve();
            };

            dfd.promise.then(wrapFireChangeListenersForThen('delete', entity));
            return dfd.promise;
        }

        function getEntity(objectStore, id, ObjectConstructor) {
            let dfd = $q.defer();

            objectStore.get(id).onsuccess = function (event) {
                dfd.resolve(new ObjectConstructor(event.target.result));
            };

            return dfd.promise;
        }

        function getAllEntities(objectStoreOrIndex, range, ObjectConstructor, maxItems) {
            let dfd = $q.defer(),
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
        }

        function getAllUniqueKeys(objectStoreOrIndex) {
            let dfd = $q.defer(),
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
        }

        function putEntityAndUpdateId(objectStore, entity) {
            let dfd = $q.defer();

            objectStore.put(entity).onsuccess = function (event) {
                entity.id = event.target.result;

                dfd.resolve(entity.id);
            };

            dfd.promise.then(wrapFireChangeListenersForThen('put', entity));
            return dfd.promise;
        }


        // -------------------------------------------------------
        // Migration helpers
        // -------------------------------------------------------

        function migrateHeadersObjectToArray(headers) {
            if (Array.isArray(headers)) return headers;

            return _(headers)
                .toPairs()
                .map(h => ({
                    name: h[0],
                    value: h[1]
                }))
                .value();
        }

        function migrateVariablesObject(variables) {
            if (!variables) {
                return {enabled: false};
            } else {
                if (!variables.hasOwnProperty('enabled')) {
                    variables.enabled = false;
                }

                return variables;
            }
        }

    }]);
