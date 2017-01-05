(function () {

    window.rester = window.rester || {};
    rester.data = rester.data || {};
    rester.data.utils = rester.data.utils || {};


    rester.data.utils.DataStore = class DataStore {
        constructor(tables) {
            this.tables = tables;
            this.writeLock = Promise.resolve();

            this.tables.forEach(table => {
                table.indexes = table.indexes || [];
                table.info = null;

                this._get(table.name).then(info => {
                    table.info = info || {
                        // Last used ID.
                        lastId: 0,

                        // List of currently stored IDs as intervals.
                        // Example: [1,2,5,8,12,12] --> 1-2, 5-8, 12
                        ids: []
                    };
                });
            });
        }

        get(tableName, ObjectConstructor, id) {
            return this._get(`${tableName}.e.${id}`).then(entity => new ObjectConstructor(entity));
        }

        getIndexKeys(tableName, index) {
            return this._get(`${tableName}.i.${index}`).then(indexData => Object.keys(indexData));
        }

        query(tableName, ObjectConstructor, top) {
            const ids = [];
            this._forEachIdInterval(tableName, (start, end) => {
                for (let id = start; id <= end; id++) {
                    ids.push(`${tableName}.e.${id}`);

                    if (top && --top === 0) {
                        return true;
                    }
                }
            });

            return this._get(ids).then(entities => Object.values(entities).map(entity => new ObjectConstructor(entity)));
        }

        transaction() {
            const dataStore = this;
            const queue = {};
            const actions = {};

            ['add', 'put', 'delete'].forEach(action => {
                actions[action] = function (tableName, entity) {
                    if (!queue[tableName]) {
                        queue[tableName] = [];
                    }

                    queue[tableName].push({ action, entity });

                    return actions;
                };
            });

            actions.execute = function () {
                return dataStore._withWriteLock(changes => {

                    const result = [];

                    const tableNames = Object.keys(queue);
                    const promises = tableNames.map(tableName => {
                        const table = dataStore.tables.find(table => table.name === tableName);
                        const initialQuery = table.indexes.map(index => `${tableName}.i.${index}`);

                        queue[tableName].forEach(({action, entity}) => {
                            if (action === 'add' || action === 'put') {
                                const isNew = !entity.hasOwnProperty('id');
                                if (isNew) {
                                    // New entity. Generate ID and store it in interval list.
                                    entity.id = ++table.info.lastId;

                                    dataStore._addIdToIntervals(tableName, entity.id);
                                } else if (action === 'add') {
                                    throw new Error(`add(${entity.id}): Cannot add an entity with an id.`);
                                } else {
                                    // Existing entity. Make sure ID exists in interval list.
                                    const interval = dataStore._findIdInterval(tableName, (start, end) => entity.id >= start && entity.id <= end);
                                    if (!interval) {
                                        throw new Error(`put(${entity.id}): Entity does not exist. Cannot insert entity with specific id.`);
                                    }
                                }

                                if (!isNew) {
                                    initialQuery.push(`${tableName}.e.${entity.id}`);
                                }
                            } else if (action === 'delete') {
                                dataStore._removeIdFromIntervals(tableName, entity.id);

                                initialQuery.push(`${tableName}.e.${entity.id}`);
                            }
                        });

                        return dataStore._get(initialQuery).then(result => {
                            const dataToSet = {
                                [tableName]: table.info
                            };

                            queue[tableName].forEach(({action, entity}) => {
                                if (action === 'add' || action === 'put') {
                                    dataToSet[`${tableName}.e.${entity.id}`] = entity;
                                }

                                const oldEntity = result[`${tableName}.e.${entity.id}`] || {};
                                table.indexes.forEach(index => {
                                    const oldValue = oldEntity[index],
                                          newValue = entity[index],
                                          indexData = result[`${tableName}.i.${index}`] || {};

                                    if (oldValue && indexData[oldValue]) {
                                        if (indexData[oldValue].length === 1) {
                                            delete indexData[oldValue];
                                        } else {
                                            const indexInIndexData = indexData[oldValue].indexOf(entity.id);
                                            indexData[oldValue].splice(indexInIndexData, 1);
                                        }
                                    }

                                    if (newValue) {
                                        if (!indexData.hasOwnProperty(newValue)) {
                                            indexData[newValue] = [];
                                        }

                                        indexData[newValue].push(entity.id);
                                    }

                                    dataToSet[`${tableName}.i.${index}`] = indexData;
                                });
                            });

                            return dataStore._set(dataToSet);
                        }).then(() => {
                            const dataToRemove = [];
                            queue[tableName].forEach(({action, entity}) => {
                                if (action === 'delete') {
                                    dataToRemove.push(`${tableName}.e.${entity.id}`);
                                }
                            });

                            return dataStore._remove(dataToRemove);
                        }).then(() => {
                            queue[tableName].forEach(({action, entity}) => {
                                changes.push({
                                    action,
                                    item: entity,
                                    itemType: entity.constructor.name
                                });

                                result.push(entity.id);
                            });
                        });
                    });

                    return Promise.all(promises).then(() => result.length === 1 ? result[0] : result);

                });
            };

            return actions;
        }

        _withWriteLock(cb) {
            const then = () => new Promise((resolve, reject) => {
                try {
                    const changes = [];
                    Promise.resolve(cb(changes)).then((...args) => {
                        rester.data.onChange.emit(changes);
                        resolve(...args);
                    }, reject);
                } catch (e) {
                    reject(e);
                }
            });

            this.writeLock = this.writeLock.then(then, then);

            return this.writeLock;
        }

        _addIdToIntervals(tableName, id) {
            const table = this.tables.find(table => table.name === tableName);
            const lastIdInIds = table.info.ids[table.info.ids.length - 1];
            if (lastIdInIds && lastIdInIds === id) {
                table.info.ids[table.info.ids.length - 1] = id;
            } else {
                table.info.ids.push(id, id);
            }
        }

        _removeIdFromIntervals(tableName, id) {
            const table = this.tables.find(table => table.name === tableName);
            const interval = this._findIdInterval(tableName, (start, end) => id >= start && id <= end);
            if (!interval) return;

            if (id === interval.start && id === interval.end) {
                // Interval contains only this ID --> remove interval
                table.info.ids.splice(interval.index * 2, 2);
            } else if (id === interval.start) {
                // ID is at start --> move start of interval one to right
                table.info.ids[interval.index * 2]++;
            } else if (id === interval.end) {
                // ID is at end --> move end of interval one to left
                table.info.ids[interval.index * 2 + 1]--;
            } else {
                // ID is in the middle --> break interval into two, with ID excluded
                table.info.ids.splice(interval.index * 2 + 1, 0, id - 1, id + 1);
            }
        }

        _forEachIdInterval(tableName, cb) {
            const table = this.tables.find(table => table.name === tableName);
            for (let i = 0; i < table.info.ids.length / 2; i++) {
                const start = table.info.ids[i * 2],
                    end = table.info.ids[i * 2 + 1];

                if (cb(start, end, i)) {
                    break;
                }
            }
        }

        _findIdInterval(tableName, cb) {
            let interval;
            this._forEachIdInterval(tableName, (start, end, index) => {
                if (cb(start, end)) {
                    interval = {
                        start,
                        end,
                        index
                    };
                    return true;
                }
            });

            return interval;
        }

        _get(keys) {
            return new Promise((resolve, reject) => {
                chrome.storage.local.get(keys, result => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve(typeof keys === 'string' ? result[keys] : result);
                    }
                });
            });
        }

        _set(keys) {
            return new Promise((resolve, reject) => {
                chrome.storage.local.set(keys, () => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve();
                    }
                });
            });
        }

        _remove(keys) {
            return new Promise((resolve, reject) => {
                chrome.storage.local.remove(keys, () => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve();
                    }
                });
            });
        }
    };

})();
