import { queryHistoryEntries } from '../../data/history.js';
import { queryRequests } from '../../data/requests.js';
import { sortedIndexOf } from '../../../shared/util.js';

/**
 * Exports data in the Postman Collection v2.1.0 format.
 *
 * Docs: https://schema.getpostman.com/json/collection/v2.1.0/docs/index.html
 * Schema: https://schema.getpostman.com/json/collection/v2.1.0/collection.json
 *
 * @param {Object} options
 * @param {Boolean} options.includeHistory - If true, the export will
 * include the history entries. Otherwise it will only include saved
 * requests.
 */
export default async function (options) {
    const requests = await queryRequests();
    const history = options.includeHistory
        ? await queryHistoryEntries()
        : [];

    return {
        info: {
            name: 'RESTer',
            schema: 'https://schema.getpostman.com/json/collection/v2.1.0/'
        },
        item: createItems(requests, history)
    };
}

class Folder {
    constructor(name) {
        this.name = name;
        this.item = [];
    }
}

class Item {
    constructor(resterRequest, resterHistoryEntries) {
        this.id = String(resterRequest.id);
        this.name = resterRequest.title;
        this.request = new Request(resterRequest);

        if (resterHistoryEntries.length > 0) {
            this.response = resterHistoryEntries.map(entry => new Response(entry));
        }
    }
}

class Request {
    constructor(resterRequest) {
        this.url = resterRequest.url;
        this.method = resterRequest.method;
        this.header = resterRequest.headers.map(header => ({
            key: header.name,
            value: header.value
        }));

        if (resterRequest.body) {
            this.body = {
                mode: 'raw',
                raw: resterRequest.body
            };
        }
    }
}

class Response {
    constructor(resterHistoryEntry) {
        this.id = String(resterHistoryEntry.id);

        // The `name` property is not documented in the schema,
        // but seems to by required by Postman. If it's not present,
        // you cannot select the response.
        this.name = `${resterHistoryEntry.time} ${resterHistoryEntry.request.title}`;

        this.originalRequest = new Request(resterHistoryEntry.request);
        if (resterHistoryEntry.timing) {
            this.responseTime = resterHistoryEntry.timing.duration;
        } else if (resterHistoryEntry.timeEnd) {
            this.responseTime = new Date(resterHistoryEntry.timeEnd) - new Date(resterHistoryEntry.time);
        }

        this.header = resterHistoryEntry.response.headers.map(header => ({
            key: header.name,
            value: header.value
        }));
        this.body = resterHistoryEntry.response.body;
        this.status = resterHistoryEntry.response.statusText;
        this.code = resterHistoryEntry.response.status;
    }
}

function sortedIndexOfFolders(folders, newFolder) {
    return sortedIndexOf(
        folders,
        newFolder,
        folder => [folder.name, folder.constructor.name]);
}

function createItems(requests, historyEntries) {
    const rootFolder = new Folder();

    function ensureFolder(path) {
        let currentFolder = rootFolder;
        const segments = path.split(/\s*\/\s*/i);
        for (const segment of segments) {
            const segmentFolder = new Folder(segment);
            const index = sortedIndexOfFolders(currentFolder.item, segmentFolder);
            let folder = currentFolder.item[index];
            if (!folder || folder.name !== segment) {
                folder = segmentFolder;
                currentFolder.item.splice(index, 0, folder);
            }

            currentFolder = folder;
        }

        return currentFolder;
    }

    for (const request of requests) {
        const requestHistory = historyEntries.filter(entry => entry.request.id === request.id);
        const folder = ensureFolder(request.collection);
        const item = new Item(request, requestHistory);

        const index = sortedIndexOfFolders(folder.item, item);
        folder.item.splice(index, 0, item);
    }

    return rootFolder.item;
}
