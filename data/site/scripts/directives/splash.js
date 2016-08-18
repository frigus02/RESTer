'use strict';

angular.module('app')
    .directive('splash', ['$window', '$q', '$rester', '$error', function ($window, $q, $rester, $error) {

        function openOldDatabase() {
            const request = $window.indexedDB.open('rester'),
                  dfd = $q.defer();

            request.onerror = function () {
                dfd.reject();
            };

            request.onsuccess = function (event) {
                const db = event.target.result;
                if (db.objectStoreNames.length > 0) {
                    dfd.resolve(db);
                } else {
                    dfd.reject();
                }
            };

            return dfd.promise;
        }

        function deleteOldDatabase() {
            $window.indexedDB.deleteDatabase('rester');
        }

        function getAllEntitiesFromDatabase(db) {
            let dfd = $q.defer(),
                transaction = db.transaction(db.objectStoreNames, 'readonly'),
                entities = {};

            transaction.oncomplete = function () {
                dfd.resolve(entities);
            };

            transaction.onerror = function (event) {
                dfd.reject('Error executing transaction: ' + event.target.errorCode);
            };

            for (let name of db.objectStoreNames) {
                const objectStore = transaction.objectStore(name);
                entities[name] = getAllEntitiesFromObjectStore(objectStore);
            }

            return dfd.promise;
        }

        function getAllEntitiesFromObjectStore(objectStore) {
            let cursorRequest = objectStore.openCursor(),
                result = [];

            cursorRequest.onsuccess = function (event) {
                let cursor = event.target.result;
                if (cursor) {
                    result.push(cursor.value);
                    cursor.continue();
                }
            };

            return result;
        }

        function saveEntitiesInNewDatabase(entities) {
            // Clean entries from IDs and angular keys, that have been added
            // by accident.
            Object.keys(entities).forEach(objectStore => {
                for (let entity of entities[objectStore]) {
                    delete entity.id;

                    const angularKeys = Object.keys(entity).filter(key => key.startsWith('$$'));
                    for (let angularKey of angularKeys) {
                        delete entity[angularKey];
                    }
                }
            });

            // Import data in new database.
            return $rester.importData(entities);
        }

        function migrateDatabase(db) {
            return getAllEntitiesFromDatabase(db)
                .then(saveEntitiesInNewDatabase)
                .then(deleteOldDatabase);
        }

        function hideSplash(element) {
            $window.requestAnimationFrame(() => {
                element.style.opacity = 0;
                element.addEventListener('transitionend', () => {
                    element.remove();
                });
            });
        }

        return {
            restrict: 'E',
            scope: {},
            templateUrl: 'views/directives/splash.html',
            link: function ($scope, $element) {
                const element = $element[0];

                $scope.isMigrating = false;

                openOldDatabase()
                    .then(
                        db => {
                            $scope.isMigrating = true;
                            return migrateDatabase(db);
                        },
                        // If database doesn't exist of cannot be opened,
                        // no migration is needed.
                        angular.noop
                    )
                    .then(() => {
                        hideSplash(element);
                    })
                    .catch(error => {
                        $error.show(error);
                    });
            }
        };

    }]);
