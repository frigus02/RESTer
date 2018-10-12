import db from '../data/utils/db.js';
import { queryHistoryEntries } from '../data/history.js';
import { queryRequests } from '../data/requests.js';
import * as providers from './providers/index.js';

/**
 * Exports all data in the specified format.
 *
 * @param {Object} options
 * @param {String} options.format - Export format. One of: 'postman'.
 * @param {Boolean} options.includeHistory - If true, the export will
 * include the history entries. Otherwise it will only include saved
 * requests.
 */
export async function exportData(options) {
    const requests = await queryRequests();
    const historyEntries = options.includeHistory
        ? await queryHistoryEntries()
        : [];

    const provider = providers[options.format];
    const data = provider.format({
        requests,
        historyEntries
    });

    const file = new File(
        [data.content],
        `rester-export-${options.format}.${data.suffix}`,
        {
            type: data.contentType
        }
    );
    const url = URL.createObjectURL(file);

    chrome.downloads.download({
        filename: file.name,
        url: url
    });
}

/**
 * Imports the specified data.
 *
 * @param {Object} options
 * @param {String} options.data - The data to import.
 * @param {String} options.collectionPrefix - Prefix for all imported
 * requests from the data.
 */
export async function importData(options) {
    let data;
    for (const provider of Object.values(providers)) {
        const parsed = provider.parse(options.data, {
            collectionPrefix: options.collectionPrefix
        });
        if (parsed.supported) {
            data = parsed.data;
            break;
        }
    }

    if (!data) {
        throw new Error('Unsupported data format.');
    }

    const transaction = db.transaction();
    for (const request of data.requests) {
        delete request.id;
        transaction.add('requests', request);
    }

    await transaction.execute();
}
