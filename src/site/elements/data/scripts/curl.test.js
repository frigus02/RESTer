import { generateCommand } from './curl.js';

describe('generateCommand', function () {
    test('empty request', function () {
        const request = { headers: [] };
        expect(generateCommand(request)).toMatchSnapshot();
    });

    test('url (simple)', function () {
        const request = { url: 'http://example.com', headers: [] };
        expect(generateCommand(request)).toMatchSnapshot();
    });

    test('url (contains dollar)', function () {
        const request = {
            url: 'http://example.com/$HOME',
            headers: [],
        };
        expect(generateCommand(request)).toMatchSnapshot();
    });

    test('url (contains quote)', function () {
        const request = {
            url: "http://example.com/?quote='",
            headers: [],
        };
        expect(generateCommand(request)).toMatchSnapshot();
    });

    test('url (contains query string)', function () {
        const request = {
            url: 'http://example.com/?foo=bar&n=1',
            headers: [],
        };
        expect(generateCommand(request)).toMatchSnapshot();
    });

    test('method (GET)', function () {
        const request = {
            method: 'GET',
            url: 'http://example.com',
            headers: [],
        };
        expect(generateCommand(request)).toMatchSnapshot();
    });

    test('method (other)', function () {
        const request = {
            method: 'PUT',
            url: 'http://example.com',
            headers: [],
        };
        expect(generateCommand(request)).toMatchSnapshot();
    });

    test('headers', function () {
        const request = {
            method: 'PUT',
            url: 'http://example.com',
            headers: [
                {
                    name: 'Accept',
                    value: 'application/json',
                },
                {
                    name: 'X-Shell-Variable',
                    value: '$HOME',
                },
                {
                    name: 'X-Quotes',
                    value: 'Some double " and single \' quotes',
                },
            ],
        };
        expect(generateCommand(request)).toMatchSnapshot();
    });

    test('body (simple)', function () {
        const request = {
            method: 'PUT',
            url: 'http://example.com',
            headers: [],
            body: 'foo=bar',
        };
        expect(generateCommand(request)).toMatchSnapshot();
    });

    test('body (needs escaping 1)', function () {
        const request = {
            method: 'PUT',
            url: 'http://example.com',
            headers: [
                {
                    name: 'Content-Type',
                    value: 'application/json',
                },
            ],
            body: `{
                "hello": "world",
                "shell": "$HOME",
                "single": "'quotes'"
            }`,
        };
        expect(generateCommand(request)).toMatchSnapshot();
    });

    test('body (needs escaping 2)', function () {
        const request = {
            method: 'PUT',
            url: 'http://example.com',
            headers: [],
            body: 'a\nb',
        };
        expect(generateCommand(request)).toMatchSnapshot();
    });

    test('body (needs escaping 3)', function () {
        const request = {
            method: 'PUT',
            url: 'http://example.com',
            headers: [],
            body: '\\',
        };
        expect(generateCommand(request)).toMatchSnapshot();
    });
});
