import db from './utils/db.js';

/**
 * @typedef Environment
 * @type {Object}
 * @property {Number} id - Unique id of the environment.
 * @property {String} name - A name for this environment. Must only consist
 * of the letter A-Za-z0-9.
 * @property {Object} values - A object of key-value pairs, which may be used
 * as variables in requests.
 */
export class Environment {
    static get defaultProperties() {
        return {
            name: '',
            values: {}
        };
    }

    constructor(dbObject) {
        Object.assign(this, Environment.defaultProperties, dbObject);
    }
}

export function putEnvironment(environment) {
    environment = new Environment(environment);
    return db.transaction().put('environments', environment).execute();
}

export function getEnvironment(id) {
    return db.get('environments', Environment, id);
}

export function queryEnvironments() {
    return db.query('environments', Environment);
}

export function deleteEnvironment(id) {
    const environment = new Environment({ id });
    return db.transaction().delete('environments', environment).execute();
}
