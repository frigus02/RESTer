import { time, dateTime, expirationDate, size, duration } from './format.js';

const referenceDate = new Date('October 23, 2015 11:25');

describe('time', function () {
    test('returns the formatted time of the specified date', function () {
        expect(time(referenceDate)).toEqual('11:25:00');
    });
});

describe('dateTime', function () {
    test('returns the formatted date and time of the specified date', function () {
        const format = new Intl.DateTimeFormat(undefined, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
        expect(dateTime(referenceDate)).toEqual(format.format(referenceDate));
    });
});

describe('expirationDate', function () {
    test('returns "Never expires" when given null', function () {
        expect(expirationDate(null)).toEqual('Never expires');
    });

    test('returns "Expired" when given a date before now', function () {
        expect(expirationDate(Date.now() - 1000)).toEqual('Expired');
    });

    test('returns the date when given a date after now', function () {
        const input = Date.now() + 1000;

        expect(expirationDate(input)).toEqual(`Expires ${dateTime(input)}`);
    });
});

describe('size', function () {
    test('returns MB', function () {
        expect(size(2.236 * 1024 * 1024)).toEqual('2.24 MB');
        expect(size(1 * 1024 * 1024)).toEqual('1.00 MB');
    });

    test('returns KB', function () {
        expect(size(1023.99 * 1024)).toEqual('1023.99 KB');
        expect(size(1 * 1024)).toEqual('1.00 KB');
    });

    test('returns B', function () {
        expect(size(1023.99)).toEqual('1023.99 B');
        expect(size(123.6)).toEqual('123.6 B');
    });
});

describe('duration', function () {
    test('returns seconds', function () {
        expect(duration(2345)).toEqual('2.35 s');
        expect(duration(1000)).toEqual('1.00 s');
    });

    test('returns millis', function () {
        expect(duration(999)).toEqual('999 ms');
        expect(duration(123)).toEqual('123 ms');
    });
});
