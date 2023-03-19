/* eslint-env node, jest */

import {
    clone,
    cloneDeep,
    randInt,
    sample,
    sortedIndexOf,
    parseCookies,
    stringifyCookies,
    mergeCookies,
    parseMediaType,
    parseStatusLine,
    getFilenameFromContentDispositionHeader,
} from './util.js';

describe('clone', function () {
    test('returns a shallow clone of an array', function () {
        const original = [1, 'test', [3, 4], { foo: 'bar' }];
        const result = clone(original);
        expect(result).toEqual(original);
        expect(result).not.toBe(original);
        expect(result[2]).toBe(original[2]);
    });

    test('returns a shallow clone of an object', function () {
        const original = { foo: 'bar', arr: [1, 2] };
        const result = clone(original);
        expect(result).toEqual(original);
        expect(result).not.toBe(original);
        expect(result.arr).toBe(original.arr);
    });
});

describe('cloneDeep', function () {
    test('returns a deep clone of an array', function () {
        const original = [1, 'test', [3, 4], { foo: 'bar' }];
        const result = cloneDeep(original);
        expect(result).toEqual(original);
        expect(result).not.toBe(original);
        expect(result[2]).not.toBe(original[2]);
    });

    test('returns a deep clone of an object', function () {
        const original = { foo: 'bar', arr: [1, 2] };
        const result = cloneDeep(original);
        expect(result).toEqual(original);
        expect(result).not.toBe(original);
        expect(result.arr).not.toBe(original.arr);
    });
});

describe('randInt', function () {
    test('returns a random number within the specified range', function () {
        const result = randInt(42, 84);
        expect(result).toBeGreaterThanOrEqual(42);
        expect(result).toBeLessThanOrEqual(84);
    });
});

describe('sample', function () {
    test('returns a random element from the specified array', function () {
        const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const result = sample(data);
        expect(data).toContain(result);
    });
});

describe('sortedIndexOf', function () {
    test('finds number element at start', function () {
        expect(sortedIndexOf([2, 3, 4], 1)).toBe(0);
    });

    test('finds number in the middle', function () {
        expect(sortedIndexOf([1, 3, 4], 2)).toBe(1);
    });

    test('finds number in the middle (number already exists)', function () {
        expect(sortedIndexOf([1, 2, 3, 4], 2)).toBe(1);
    });

    test('finds string in the middle', function () {
        expect(sortedIndexOf(['apple', 'grape', 'orange'], 'melon')).toBe(2);
    });

    test('finds object in the middle', function () {
        expect(
            sortedIndexOf(
                [{ name: 'apple' }, { name: 'grape' }, { name: 'orange' }],
                { name: 'melon' },
                (x) => x.name
            )
        ).toBe(2);
    });

    test('finds array in the middle', function () {
        expect(
            sortedIndexOf(
                [
                    ['comments', 'folder'],
                    ['posts', 'folder'],
                    ['posts', 'item'],
                ],
                ['comments,a', 'item']
            )
        ).toBe(1);
    });
});

describe('parseCookies', function () {
    test('parses cookie string', function () {
        expect(parseCookies('foo=bar;a=b; complex=1=2=3 ; foo=baz')).toEqual({
            foo: 'baz',
            a: 'b',
            complex: '1=2=3',
        });
    });
});

describe('stringifyCookies', function () {
    test('makes cookie string from object', function () {
        expect(
            stringifyCookies({
                foo: 'baz',
                a: 'b',
                complex: '1=2=3',
            })
        ).toBe('foo=baz; a=b; complex=1=2=3');
    });
});

describe('mergeCookies', function () {
    test('merges cookie strings', function () {
        expect(mergeCookies('foo=bar; a=b', 'complex=1=2=3;foo=baz;')).toBe(
            'foo=baz; a=b; complex=1=2=3'
        );
    });
});

describe('parseMediaType', function () {
    test('no params', function () {
        expect(parseMediaType('application/json')).toEqual({
            type: 'application/json',
        });
    });

    test('one param', function () {
        expect(parseMediaType('application/json;charset=utf-8')).toEqual({
            type: 'application/json',
        });
    });

    test('multiple params', function () {
        expect(
            parseMediaType('application/json;charset=utf-8;boundary=123')
        ).toEqual({ type: 'application/json' });
    });

    test('spaces around semicolon', function () {
        expect(parseMediaType('application/json ; charset=utf-8')).toEqual({
            type: 'application/json',
        });
    });

    test('empty string', function () {
        expect(parseMediaType('')).toEqual({ type: '' });
    });
});

describe('parseStatusLine', function () {
    test('HTTP/0.9 response', function () {
        expect(parseStatusLine('HTTP/0.9 200 OK')).toEqual({
            httpVersion: 'HTTP/0.9',
            statusCode: 200,
            reasonPhrase: 'OK',
        });
    });

    test('HTTP/1.1 response', function () {
        expect(parseStatusLine('HTTP/1.1 200 OK')).toEqual({
            httpVersion: 'HTTP/1.1',
            statusCode: 200,
            reasonPhrase: 'OK',
        });
    });

    test('spaces in reason phrase', function () {
        expect(parseStatusLine('HTTP/1.1 404 Not Found')).toEqual({
            httpVersion: 'HTTP/1.1',
            statusCode: 404,
            reasonPhrase: 'Not Found',
        });
    });

    test('invalid: empty reason phrase', function () {
        expect(parseStatusLine('HTTP/1.1 200')).toEqual({
            httpVersion: 'HTTP/1.1',
            statusCode: 200,
            reasonPhrase: '',
        });
    });

    test('invalid: no status code', function () {
        expect(parseStatusLine('HTTP/1.1')).toEqual({
            httpVersion: 'HTTP/1.1',
            statusCode: 0,
            reasonPhrase: '',
        });
    });

    test('invalid: status code is not a string', function () {
        expect(parseStatusLine('HTTP/1.1 ABC DEF')).toEqual({
            httpVersion: 'HTTP/1.1',
            statusCode: Number.NaN,
            reasonPhrase: 'DEF',
        });
    });
});

describe('getFilenameFromContentDispositionHeader', function () {
    test('utf8', function () {
        expect(
            getFilenameFromContentDispositionHeader(
                "attachment;filename*=UTF-8''%6A%C5%AF%C5%AF%C5%AF%C5%BE%C4%9B%2E%74%78%74"
            )
        ).toEqual('jůůůžě.txt');
    });

    test('ascii', function () {
        expect(
            getFilenameFromContentDispositionHeader(
                'attachment; filename="cool.html"'
            )
        ).toEqual('cool.html');
    });

    test('reverved characters', function () {
        expect(
            getFilenameFromContentDispositionHeader(
                'attachment; filename="../c|o?ol.html"'
            )
        ).toEqual('cool.html');
    });
});
