/* eslint-env node, jest */

import {
    encodeQueryString,
    decodeQueryString,
    generateUri,
    encodeFormValue,
    mapFilesToVariableValues,
    truncate,
} from './encode.js';

const params = {
    $filter: "Name eq 'John'",
    $select: 'Age,MailAddress',
    numbers: ['12', '24'],
};

const queryString =
    '%24filter=Name+eq+%27John%27&%24select=Age%2CMailAddress&numbers=12&numbers=24';

describe('encodeQueryString', function () {
    test('encodes specified object into query string', function () {
        expect(encodeQueryString(params)).toEqual(queryString);
    });
});

describe('decodeQueryString', function () {
    test('decodes specified query string into object', function () {
        expect(decodeQueryString(queryString)).toEqual(params);
    });
});

describe('generateUri', function () {
    test('appends encoded params to base url', function () {
        const baseUrl = 'https://example.com/test';
        const simpleParams = { name: 'John' };

        expect(generateUri(baseUrl, simpleParams)).toEqual(
            `${baseUrl}?name=John`,
        );
    });

    test('appends encoded params to existing params on base url', function () {
        const baseUrl = 'https://example.com/test?age=34';
        const simpleParams = { name: 'John' };

        expect(generateUri(baseUrl, simpleParams)).toEqual(
            `${baseUrl}&name=John`,
        );
    });
});

describe('encodeFormValue', function () {
    test('encodes the given string but leaves curly braces in for variable detection', function () {
        const value = '{foo}&bar{&baz}and{$env.test}';

        expect(encodeFormValue(value)).toEqual(
            '{foo}%26bar{%26baz}and{$env.test}',
        );
    });
});

describe('mapFilesToVariableValues', function () {
    test('returns object containing all file data', function () {
        const firstFile = {};
        const secondFile = {};
        const result = mapFilesToVariableValues({
            first: firstFile,
            second: secondFile,
        });

        expect(result['$file.first']).toEqual(firstFile);
        expect(result['$file.second']).toEqual(secondFile);
    });
});

describe('truncate', function () {
    test('leaves string untouched when shorter than maxlength', function () {
        const value = 'my short string';

        expect(truncate(value, 100)).toEqual(value);
    });

    test('trims string and appends ellipsis when longer than maxlength', function () {
        const value = 'my loooooooooooooooooong string';

        expect(truncate(value, 15)).toEqual('my loooooooooo…');
    });
});
