import CustomEventTarget from '../../../shared/custom-event-target.js';

class DataStore extends CustomEventTarget {
    constructor(tables) {
        super();

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
        return this._get(`${tableName}.e.${id}`).then(
            entity => entity && new ObjectConstructor(entity)
        );
    }

    getIndexKeys(tableName, index) {
        return this._get(`${tableName}.i.${index}`).then(indexData =>
            indexData ? Object.keys(indexData) : []
        );
    }

    query(tableName, ObjectConstructor, top) {
        const ids = [];
        this._forEachIdIntervalReverse(tableName, (start, end) => {
            for (let id = end; id >= start; id--) {
                ids.push(`${tableName}.e.${id}`);

                if (top && --top === 0) {
                    return true;
                }
            }
        });

        return this._get(ids).then(entities =>
            Object.values(entities)
                .map(entity => new ObjectConstructor(entity))
                .sort((a, b) => b.id - a.id)
        );
    }

    transaction() {
        const dataStore = this;
        const queue = {};
        const actions = {};

        ['add', 'put', 'delete'].forEach(action => {
            actions[action] = function(tableName, entity) {
                if (!queue[tableName]) {
                    queue[tableName] = [];
                }

                queue[tableName].push({ action, entity });

                return actions;
            };
        });

        actions.execute = function() {
            return dataStore._withWriteLock(changes => {
                const result = [];

                const tableNames = Object.keys(queue);
                const promises = tableNames.map(tableName => {
                    const table = dataStore.tables.find(
                        table => table.name === tableName
                    );
                    const initialQuery = table.indexes.map(
                        index => `${tableName}.i.${index}`
                    );

                    queue[tableName].forEach(({ action, entity }) => {
                        if (action === 'add' || action === 'put') {
                            const isNew = !entity.hasOwnProperty('id');
                            if (isNew) {
                                // New entity. Generate ID and store it in interval list.
                                entity.id = ++table.info.lastId;

                                dataStore._addIdToIntervals(
                                    tableName,
                                    entity.id
                                );
                            } else if (action === 'add') {
                                throw new Error(
                                    `add(${
                                        entity.id
                                    }): Cannot add an entity with an id.`
                                );
                            } else {
                                // Existing entity. Make sure ID exists in interval list.
                                const interval = dataStore._findIdInterval(
                                    tableName,
                                    (start, end) =>
                                        entity.id >= start && entity.id <= end
                                );
                                if (!interval) {
                                    throw new Error(
                                        `put(${
                                            entity.id
                                        }): Entity does not exist. Cannot insert entity with specific id.`
                                    );
                                }
                            }

                            if (!isNew) {
                                initialQuery.push(
                                    `${tableName}.e.${entity.id}`
                                );
                            }
                        } else if (action === 'delete') {
                            dataStore._removeIdFromIntervals(
                                tableName,
                                entity.id
                            );

                            initialQuery.push(`${tableName}.e.${entity.id}`);
                        }
                    });

                    return dataStore
                        ._get(initialQuery)
                        .then(result => {
                            const dataToSet = {
                                [tableName]: table.info
                            };

                            queue[tableName].forEach(({ action, entity }) => {
                                if (action === 'add' || action === 'put') {
                                    dataToSet[
                                        `${tableName}.e.${entity.id}`
                                    ] = entity;
                                }

                                const oldEntity =
                                    result[`${tableName}.e.${entity.id}`] || {};
                                table.indexes.forEach(index => {
                                    const oldValue = oldEntity[index];
                                    const newValue = entity[index];
                                    const indexData =
                                        result[`${tableName}.i.${index}`] || {};

                                    if (oldValue && indexData[oldValue]) {
                                        if (indexData[oldValue].length === 1) {
                                            delete indexData[oldValue];
                                        } else {
                                            const indexInIndexData = indexData[
                                                oldValue
                                            ].indexOf(entity.id);
                                            indexData[oldValue].splice(
                                                indexInIndexData,
                                                1
                                            );
                                        }
                                    }

                                    if (newValue) {
                                        if (
                                            !indexData.hasOwnProperty(newValue)
                                        ) {
                                            indexData[newValue] = [];
                                        }

                                        indexData[newValue].push(entity.id);
                                    }

                                    dataToSet[
                                        `${tableName}.i.${index}`
                                    ] = indexData;
                                });
                            });

                            return dataStore._set(dataToSet);
                        })
                        .then(() => {
                            const dataToRemove = [];
                            queue[tableName].forEach(({ action, entity }) => {
                                if (action === 'delete') {
                                    dataToRemove.push(
                                        `${tableName}.e.${entity.id}`
                                    );
                                }
                            });

                            if (dataToRemove.length > 0) {
                                return dataStore._remove(dataToRemove);
                            }
                        })
                        .then(() => {
                            queue[tableName].forEach(({ action, entity }) => {
                                changes.push({
                                    action,
                                    item: entity,
                                    itemType: entity.constructor.type
                                });

                                result.push(entity.id);
                            });
                        });
                });

                return Promise.all(promises).then(() =>
                    result.length === 1 ? result[0] : result
                );
            });
        };

        return actions;
    }

    _withWriteLock(cb) {
        const then = () =>
            new Promise((resolve, reject) => {
                try {
                    const changes = [];
                    Promise.resolve(cb(changes)).then((...args) => {
                        this.dispatchEvent(
                            new CustomEvent('change', {
                                detail: changes
                            })
                        );
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
        const interval = this._findIdInterval(
            tableName,
            (start, end) => id >= start && id <= end
        );
        if (!interval) {
            return;
        }

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
            const start = table.info.ids[i * 2];
            const end = table.info.ids[i * 2 + 1];

            if (cb(start, end, i)) {
                break;
            }
        }
    }

    _forEachIdIntervalReverse(tableName, cb) {
        const table = this.tables.find(table => table.name === tableName);
        for (let i = table.info.ids.length / 2 - 1; i >= 0; i--) {
            const start = table.info.ids[i * 2];
            const end = table.info.ids[i * 2 + 1];

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
        return this._performStorageLocalOperation('get', keys, result =>
            typeof keys === 'string' ? result[keys] : result
        );
    }

    _set(keys) {
        return this._performStorageLocalOperation('set', keys);
    }

    _remove(keys) {
        return this._performStorageLocalOperation('remove', keys);
    }

    _performStorageLocalOperation(
        op,
        keys,
        transformSuccessResult = arg => arg
    ) {
        return new Promise((resolve, reject) => {
            const start = performance.now();
            chrome.storage.local[op](keys, result => {
                const millis = performance.now() - start;
                if (millis > 500) {
                    this.dispatchEvent(
                        new CustomEvent('slowPerformance', {
                            detail: {
                                operation: `storage.local.${op}(...)`,
                                duration: Math.round(millis)
                            }
                        })
                    );
                }

                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(transformSuccessResult(result));
                }
            });
        });
    }
}

export default DataStore;
