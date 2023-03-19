/**
 * Clones the first layer specified object.
 */
export function clone(obj) {
    if (Array.isArray(obj)) {
        return [...obj];
    } else {
        return Object.assign({}, obj);
    }
}

/**
 * Clones the entire object by converting to and parsing JSON.
 * Should be used sparingly.
 */
export function cloneDeep(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Returns a random item from the specified array.
 */
export function sample(arr) {
    return arr[randInt(0, arr.length - 1)];
}

/**
 * Generates a random integer in the specified range.
 */
export function randInt(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}

const debounceFunctionTimeouts = new WeakMap();

/**
 * Debounces the specified function.
 */
export function debounce(func, delay, ...args) {
    cancelDebounce(func);

    const timeout = setTimeout(func, delay, ...args);
    debounceFunctionTimeouts.set(func, timeout);
}

/**
 * Cancels a function call, which was scheduled using debounce.
 */
export function cancelDebounce(func) {
    const oldTimeout = debounceFunctionTimeouts.get(func);
    if (oldTimeout) {
        clearTimeout(oldTimeout);
    }
}

/**
 * Compares two values of any type. If values are not of
 * the same type, they are converted to strings and compared
 * lexically.
 *
 * Returns a number, which is:
 *  - nagative, if a < b
 *  - 0, if a = b
 *  - positive, if a > b
 */
export function compareAny(a, b) {
    if (a === b) {
        return 0;
    } else if (a === undefined) {
        return -1;
    } else if (b === undefined) {
        return 1;
    } else if (a === null) {
        return -1;
    } else if (b === null) {
        return 1;
    } else if (typeof a === 'number' && typeof b === 'number') {
        return a - b;
    } else if (Array.isArray(a) && Array.isArray(b)) {
        const len = Math.min(a.length, b.length);
        for (let i = 0; i < len; i++) {
            const result = compareAny(a[i], b[i]);
            if (result !== 0) {
                return result;
            }
        }

        return a.length - b.length;
    } else {
        return String(a).localeCompare(String(b));
    }
}

function createIteree(prop) {
    if (typeof prop === 'undefined' || prop === null) {
        return (obj) => obj;
    } else if (typeof prop === 'function') {
        return (obj) => prop(obj);
    } else {
        return (obj) => obj[prop];
    }
}

/**
 * Sorts the array by the specified iteree. The iteree can be
 *  - a function, which takes an item of the array and returns the
 *    value to be used for sorting
 *  - a string, which is used as a property name
 *  - undefined/null, which compares the plain array values
 */
export function sort(arr, iteree) {
    iteree = createIteree(iteree);

    return arr.sort((a, b) => compareAny(iteree(a), iteree(b)));
}

/**
 * Uses a binary search to find the index at which the specified
 * value needs to be inserted in the array to keep its sorting order.
 */
export function sortedIndexOf(arr, value, iteree) {
    if (arr.length === 0) {
        return 0;
    }

    iteree = createIteree(iteree);
    value = iteree(value);

    let low = 0,
        high = arr.length - 1;
    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const compared = compareAny(iteree(arr[mid]), value);
        if (compared < 0) {
            low = mid + 1;
        } else if (compared > 0) {
            high = mid - 1;
        } else {
            return mid;
        }
    }

    // Value not found. It needs to be inserted at position
    // `low`, so the array keeps its sort order.
    return low;
}

/**
 * Groups the specified array by the value returned by iteree. Returns
 * an object with the following schema:
 *  {
 *      "name1": [<item>, <item>, ...],
 *      "name2": [<item>, <item>, ...]
 *  }
 */
export function group(arr, iteree) {
    iteree = createIteree(iteree);

    const groups = {};
    for (const item of arr) {
        const name = iteree(item);
        if (!groups[name]) {
            groups[name] = [];
        }

        groups[name].push(item);
    }

    return groups;
}

/**
 * Parses the specified media type and returns an object with the type only.
 * Parameter parsing might be added later when needed.
 * See: https://tools.ietf.org/html/rfc7231#section-3.1.1.1
 * @param {string} mediaType
 */
export function parseMediaType(mediaType) {
    const type = mediaType.substr(0, `${mediaType};`.indexOf(';')).trim();
    return { type };
}
