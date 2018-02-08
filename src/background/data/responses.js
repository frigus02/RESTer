import { migrateHeadersObjectToArray } from './utils/migrations.js';

/**
 * @typedef Response
 * @type {Object}
 * @property {Number} status - The HTTP status code.
 * @property {String} statusText - The status text.
 * @property {Array} headers - The response headers as an array oj objects.
 * Each object has the properties `name` and `value`.
 * @property {String} body - The response body as string.
 */
export class Response {
    static get defaultProperties() {
        return {
            status: 0,
            statusText: null,
            headers: [],
            body: null
        };
    }

    constructor(dbObject) {
        Object.assign(this, Response.defaultProperties, dbObject);
        this.headers = migrateHeadersObjectToArray(this.headers);
    }
}
