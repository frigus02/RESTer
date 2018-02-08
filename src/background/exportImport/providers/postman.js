import { Request } from '../../data/requests.js';
import { sortedIndexOf } from '../../../shared/util.js';

const supportedSchemas = [
    'https://schema.getpostman.com/json/collection/v2.0.0/collection.json',
    'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
];

/**
 * Formats data in the Postman Collection v2.1.0 format.
 *
 * Docs: https://schema.getpostman.com/json/collection/v2.1.0/docs/index.html
 *
 * @param {Object} data
 * @param {Array<Request>} data.requests
 * @param {Array<HistoryEntry>} data.historyEntries
 */
export function format(data) {
    const collection = {
        info: {
            name: 'RESTer',
            schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
        },
        item: createPostmanCollectionItems(data)
    };

    return {
        contentType: 'application/json',
        content: JSON.stringify(collection, null, 4),
        suffix: 'json'
    };
}

/**
 * Parses data in the Postman Collection v2.0.0 or v2.1.0 format.
 *
 * Docs: https://schema.getpostman.com/json/collection/v2.1.0/docs/index.html
 *
 * @param {String} data - The data to import.
 * @param {Object} options
 * @param {String} options.collectionPrefix - Prefix for all imported
 * requests from the data.
 */
export function parse(data, options) {
    let collection;
    try {
        collection = JSON.parse(data);
        if (!supportedSchemas.includes(collection.info.schema)) {
            throw new Error('Schema not supported.');
        }
    } catch (e) {
        return {
            supported: false,
            error: e
        };
    }

    const items = createResterData(collection.item, options.collectionPrefix);
    return {
        supported: true,
        data: items
    };
}

class PostmanFolder {
    constructor(name) {
        this.name = name;
        this.item = [];
    }

    static isPostmanFolder(obj) {
        return Array.isArray(obj.item);
    }
}

class PostmanItem {
    static fromResterRequest(resterRequest, resterHistoryEntries) {
        const item = new PostmanItem();
        item.id = formatId(resterRequest.id);
        item.name = resterRequest.title;
        item.request = PostmanRequest.fromResterRequest(resterRequest);

        if (resterHistoryEntries.length > 0) {
            item.response = resterHistoryEntries.map(PostmanResponse.fromResterHistoryEntry);
        }

        return item;
    }

    constructor(props) {
        Object.assign(this, props);
        this.request = new PostmanRequest(this.request);
        if (this.response) {
            this.response = this.response.map(response => new PostmanResponse(response));
        }
    }

    toResterRequest() {
        const request = this.request.toResterRequest();
        if (this.id) {
            request.id = parseId(this.id);
        }

        request.title = this.name || '<no title>';
        return request;
    }
}

class PostmanRequest {
    static fromResterRequest(resterRequest) {
        const request = new PostmanRequest();
        request.url = resterRequest.url;
        request.method = resterRequest.method;
        request.header = resterRequest.headers.map(header => ({
            key: header.name,
            value: header.value
        }));

        if (resterRequest.body) {
            request.body = {
                mode: 'raw',
                raw: resterRequest.body
            };
        }

        return request;
    }

    static isPostmanRequest(obj) {
        return typeof obj === 'object' && obj.url;
    }

    constructor(props) {
        Object.assign(this, props);
    }

    toResterRequest() {
        const request = new Request();
        request.method = this.method;
        request.url = typeof this.url === 'object'
            ? this.url.raw
            : this.url;

        if (Array.isArray(this.header)) {
            request.headers = this.header
                .filter(header => !header.disabled)
                .map(header => ({
                    name: header.key,
                    value: header.value
                }));
        }

        if (this.body) {
            if (this.body.mode === 'raw') {
                request.body = this.body.raw;
            } else if (this.body.mode === 'urlencoded') {
                request.body = formatUrlencodedOrFormdataBody(this.body.urlencoded);
            } else if (this.body.mode === 'formdata') {
                request.body = formatUrlencodedOrFormdataBody(this.body.formdata);
            }
        }

        return request;
    }
}

class PostmanResponse {
    static fromResterHistoryEntry(resterHistoryEntry) {
        const response = new PostmanResponse();
        response.id = formatId(resterHistoryEntry.id);

        // The `name` property is not documented in the schema,
        // but seems to by required by Postman. If it's not present,
        // you cannot select the response.
        response.name = `${resterHistoryEntry.time} ${resterHistoryEntry.request.title}`;

        response.originalRequest = PostmanRequest.fromResterRequest(resterHistoryEntry.request);
        if (resterHistoryEntry.timing) {
            response.responseTime = resterHistoryEntry.timing.duration;
        } else if (resterHistoryEntry.timeEnd) {
            response.responseTime = new Date(resterHistoryEntry.timeEnd) - new Date(resterHistoryEntry.time);
        }

        response.header = resterHistoryEntry.response.headers.map(header => ({
            key: header.name,
            value: header.value
        }));
        response.body = resterHistoryEntry.response.body;
        response.status = resterHistoryEntry.response.statusText;
        response.code = resterHistoryEntry.response.status;

        return response;
    }

    constructor(props) {
        Object.assign(this, props);
        if (this.originalRequest) {
            this.originalRequest = new PostmanRequest(this.originalRequest);
        }
    }
}

function formatId(resterId) {
    return `rester-${resterId}`;
}

function parseId(postmanId) {
    return postmanId.startsWith('rester-')
        ? parseInt(postmanId.substr(7), 10)
        : postmanId;
}

function formatUrlencodedOrFormdataBody(parameters) {
    return parameters
        .filter(param => param.key.trim() && !param.disabled)
        .map(param => `${encodeURIComponent(param.key)}=${encodeURIComponent(param.value)}`)
        .join('&');
}

function sortedIndexOfFolders(folders, newFolder) {
    return sortedIndexOf(
        folders,
        newFolder,
        folder => [folder.name, folder.constructor.name]);
}

function createPostmanCollectionItems({ requests, historyEntries }) {
    const rootFolder = new PostmanFolder();

    function ensureFolder(path) {
        let currentFolder = rootFolder;
        const segments = path.split(/\s*\/\s*/i);
        for (const segment of segments) {
            const segmentFolder = new PostmanFolder(segment);
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
        const item = PostmanItem.fromResterRequest(request, requestHistory);

        const index = sortedIndexOfFolders(folder.item, item);
        folder.item.splice(index, 0, item);
    }

    return rootFolder.item;
}

function appendCollection(existing, add) {
    existing = existing.trim();
    add = add.trim();
    return existing ? `${existing} / ${add}` : add;
}

function createResterData(items, collection) {
    const requests = [];

    for (const item of items) {
        if (PostmanFolder.isPostmanFolder(item)) {
            const data = createResterData(item.item, appendCollection(collection, item.name));
            requests.push(...data.requests);
        } else if (PostmanRequest.isPostmanRequest(item.request)) {
            const postmanItem = new PostmanItem(item);
            const request = postmanItem.toResterRequest();
            request.collection = collection;
            requests.push(request);
        }
    }

    return {
        requests
    };
}
