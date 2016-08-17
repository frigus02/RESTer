'use strict';

const { migrateHeadersObjectToArray } = require('lib/data/utils/migrations');


/**
 * @typedef Response
 * @type {Object}
 * @property {Number} status - The HTTP status code.
 * @property {String} statusText - The status text.
 * @property {Array} headers - The response headers as an array oj objects.
 * Each object has the properties `name` and `value`.
 * @property {String} body - The response body as string.
 */
exports.Response = function (dbObject) {
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
