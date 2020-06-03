import db from './utils/db.js';
import { Request } from './requests.js';
import { Response } from './responses.js';

/**
 * @typedef HistoryEntry
 * @type {Object}
 * @property {Number} id - The id of the history entry.
 * @property {Date} time - The time at which the request has started.
 * @property {Date} timeEnd - The time at which the request has finished.
 * @property {Object} timing - The PerformanceResourceTiming for the request.
 * @property {Request} request - The executed request.
 * @property {Response} response - The response.
 * @property {Number} size - Size of the full history object in bytes.
 */
export class HistoryEntry {
    static get type() {
        return 'HistoryEntry';
    }

    static get defaultProperties() {
        return {
            time: 0,
            timeEnd: 0,
            request: null,
            response: null,
        };
    }

    constructor(dbObject) {
        Object.assign(this, HistoryEntry.defaultProperties, dbObject);
        if (this.request) {
            this.request = new Request(this.request);
        }

        if (this.response) {
            this.response = new Response(this.response);
        }

        this.size = JSON.stringify(this).length;
    }
}

/**
 * Adds a new history entry to the database. If this entry is not unique
 * an exception is thrown.
 *
 * @param {HistoryEntry} entry - The new history entry.
 * @returns {Promise.<Number>} A promise, which gets resolved, when the entry
 * was successfully saved and returns the new history entry íd.
 */
export function addHistoryEntry(entry) {
    entry = new HistoryEntry(entry);
    return db.transaction().add('history', entry).execute();
}

/**
 * Return the full history entry object for the specified key.
 *
 * @param {Number} id - The id of the history entry.
 * @returns {Promise.<HistoryEntry>} A promise which returns a the
 * full history entry object when resolved.
 */
export function getHistoryEntry(id) {
    return db.get('history', HistoryEntry, id);
}

/**
 * Returns all history entries, including only a subset of all properties.
 *
 * @param {Number=0} top - When specified, the method only returns this amount
 * of newest items.
 * @returns {Promise.<Array<HistoryEntry>>} A promise which returns
 * a list of history entries when resolved.
 */
export function queryHistoryEntries(top) {
    return db.query('history', HistoryEntry, top);
}

/**
 * Deletes an existing history entry from the database.
 *
 * @param {Number|Array<Number>} ids - The id of the history entry or
 * an array of ids.
 * @returns {Promise} A promise which gets resolved, when the entry was
 * successfully deleted.
 */
export function deleteHistoryEntries(ids) {
    if (!Array.isArray(ids)) {
        ids = [ids];
    }

    const transaction = db.transaction();
    for (let id of ids) {
        const entry = new HistoryEntry({ id });
        transaction.delete('history', entry);
    }

    return transaction.execute();
}
