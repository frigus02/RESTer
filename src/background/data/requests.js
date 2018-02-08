import { migrateHeadersObjectToArray, migrateVariablesObject } from './utils/migrations.js';
import db from './utils/db.js';

/**
 * @typedef Request
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
 * @property {Object} variables.values - The replacement values. This will
 * never be stored when saving requests. It is however available in the
 * history of completed requests.
 */
export class Request {
    static get defaultProperties() {
        return {
            collection: null,
            title: null,
            method: null,
            url: null,
            headers: [],
            body: null,
            variables: {enabled: false}
        };
    }

    constructor(dbObject) {
        Object.assign(this, Request.defaultProperties, dbObject);

        // Normalize slashes in collection, so there is exactly one space
        // before and after the slash.
        if (this.collection) {
            this.collection = this.collection.split(/\s*\/\s*/g).join(' / ');
        }

        this.headers = migrateHeadersObjectToArray(this.headers);
        this.variables = migrateVariablesObject(this.variables);
    }
}

/**
 * Adds a new request to the database or updates an existing one with the
 * same collection and title.
 *
 * @param {Request} request - The request to save in database.
 * @returns {Promise.<Number>} A promise which gets resolved, when the request
 * was successfully saved and returns the new request id.
 */
export function putRequest(request) {
    request = new Request(request);

    // Remove variable values. They will only be saved in the history.
    if (request.variables && 'values' in request.variables) {
        delete request.variables.values;
    }

    return db.transaction().put('requests', request).execute();
}

/**
 * Return the full request object for the specified key.
 *
 * @param {Number} id - The id of the request.
 * @returns {Promise.<Request>} A promise which returns a the full request
 * object when resolved.
 */
export function getRequest(id) {
    return db.get('requests', Request, id);
}

/**
 * Returns all requests.
 *
 * @returns {Promise.<Array<Request>>} A promise which returns a list of
 * requests when resolved.
 */
export function queryRequests() {
    return db.query('requests', Request);
}

/**
 * Returns all collections, that were used in any request.
 *
 * @returns {Promise.<Array<String>>} A promise which returns a list of
 * all used collections.
 */
export function queryRequestCollections() {
    return db.getIndexKeys('requests', 'collection');
}

/**
 * Deletes an existing request from the database.
 *
 * @param {Number} id - The id of the request.
 * @returns {Promise} A promise which gets resolved, when the request was
 * successfully deleted.
 */
export function deleteRequest(id) {
    const request = new Request({ id });
    return db.transaction().delete('requests', request).execute();
}
