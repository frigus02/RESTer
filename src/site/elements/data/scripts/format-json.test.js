/* eslint-env node, jest */

import { formatJson } from './format-json.js';

describe('formatJson', function () {
    test('formats minified object', function () {
        expect(formatJson('{"foo":1,"bar":"2"}')).toEqual(
            '{\n    "foo": 1,\n    "bar": "2"\n}'
        );
    });

    test('formats minified array', function () {
        expect(formatJson('["foo",2]')).toEqual('[\n    "foo",\n    2\n]');
    });

    test('formats inconsistently formatted object', function () {
        expect(formatJson(' {\n  "foo":1,\n\n\t"bar" : "2"}\n\n  \n')).toEqual(
            '{\n    "foo": 1,\n    "bar": "2"\n}'
        );
    });

    test('throw in case of too much nesting', function () {
        const depth = 502;
        const json = '['.repeat(depth) + ']'.repeat(depth);
        expect(() => formatJson(json)).toThrow(
            'ParseError at 501: max depth reached'
        );
    });

    const values = {
        string: '"abc \\" \\\\ \\/ \\b \\f \\n \\r \\t \\u0000"',
        number: '0',
        'big number': '55871516310040211',
        'negative number': '-0',
        'number with fraction': '0.000',
        'number with exponent 1': '1e+111',
        'number with exponent 2': '1e-111',
        'number with exponent 3': '1E111',
        object: '{}',
        array: '[]',
        true: 'true',
        false: 'false',
        null: 'null',
        nan: 'NaN',
    };
    for (const [name, value] of Object.entries(values)) {
        test(`handles ${name}`, () => {
            expect(formatJson(value)).toEqual(value);
        });
    }
});
