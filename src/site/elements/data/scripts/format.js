const optionsDate = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
};
const optionsTime = {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
};
const formatTime = new Intl.DateTimeFormat(undefined, optionsTime);
const formatDateTime = new Intl.DateTimeFormat(
    undefined,
    Object.assign({}, optionsDate, optionsTime)
);

const sizeKB = 1024;
const sizeMB = sizeKB * 1024;

export function time(date) {
    return formatTime.format(new Date(date));
}

export function dateTime(date) {
    return formatDateTime.format(new Date(date));
}

export function expirationDate(date) {
    if (date) {
        if (new Date(date) < new Date()) {
            return 'Expired';
        } else {
            return 'Expires ' + dateTime(date);
        }
    } else {
        return 'Never expires';
    }
}

export function size(bytes) {
    if (bytes >= sizeMB) {
        return `${(bytes / sizeMB).toFixed(2)} MB`;
    } else if (bytes >= sizeKB) {
        return `${(bytes / sizeKB).toFixed(2)} KB`;
    } else {
        return `${bytes} B`;
    }
}

export function duration(millis, digits) {
    if (millis >= 1000) {
        return `${(millis / 1000).toFixed(2)} s`;
    } else {
        return `${millis.toFixed(digits)} ms`;
    }
}
