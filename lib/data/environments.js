'use strict';

const db = require('lib/data/utils/db');


/**
 * @typedef Environment
 * @type {Object}
 * @property {Number} id - Unique id of the environment.
 * @property {String} name - A name for this environment. Must only consist
 * of the letter A-Za-z0-9.
 * @property {Object} values - A object of key-value pairs, which may be used
 * as variables in requests.
 */
exports.Environment = Environment;
function Environment(dbObject) {
    if (dbObject) {
        Object.assign(this, dbObject);
    } else {
        this.name = '';
        this.values = {};
    }
}

exports.put = function (environment) {
    environment = new Environment(environment);
    return db.transaction(['environments'], (transaction, objectStores) => {
        return db.putEntityAndUpdateId(objectStores[0], environment);
    });
};

exports.get = function (id) {
    return db.transaction(['environments'], (transaction, objectStores) => {
        return db.getEntity(objectStores[0], id, Environment);
    });
};

exports.query = function () {
    return db.transaction(['environments'], (transaction, objectStores) => {
        return db.getAllEntities(objectStores[0], null, Environment);
    });
};

exports.delete = function (environment) {
    environment = new Environment(environment);
    return db.transaction(['environments'], (transaction, objectStores) => {
        return db.deleteEntity(objectStores[0], environment);
    });
};
