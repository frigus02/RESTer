import { format, parse } from './postman.js';

jest.mock('../../data/utils/db.js');

describe('format', function () {
    test('creates nested folder structure for requests', function () {
        expect(
            format({
                requests: [
                    {
                        id: 1,
                        collection: 'A / B / C',
                        title: 'Number 1',
                        method: 'GET',
                        url: 'https://example.com',
                        headers: [],
                        body: null,
                    },
                    {
                        id: 2,
                        collection: 'A / B / C',
                        title: 'Number 2',
                        method: 'POST',
                        url: 'https://example.com',
                        headers: [
                            {
                                name: 'Content-Type',
                                value: 'application/json',
                            },
                        ],
                        body: '{"foo": "bar"}',
                    },
                ],
                historyEntries: [],
            }),
        ).toMatchSnapshot();
    });

    test('adds history entries as responses to matching request', function () {
        expect(
            format({
                requests: [
                    {
                        id: 1,
                        collection: 'A',
                        title: 'Number 1',
                        method: 'GET',
                        url: 'https://example.com',
                        headers: [],
                        body: null,
                    },
                    {
                        id: 2,
                        collection: 'B',
                        title: 'Number 2',
                        method: 'POST',
                        url: 'https://example.com',
                        headers: [],
                        body: null,
                    },
                ],
                historyEntries: [
                    {
                        id: 1,
                        time: 100,
                        timeEnd: 120,
                        request: {
                            id: 1,
                            collection: 'A',
                            title: 'To-do: come up with name',
                            method: 'GET',
                            url: 'https://example.com',
                            headers: [],
                            body: null,
                        },
                        response: {
                            status: 200,
                            statusText: 'OK',
                            headers: [
                                {
                                    name: 'Content-Type',
                                    value: 'text/html',
                                },
                            ],
                            body: '<!DOCTYPE html>\n<html>\n</html>\n',
                        },
                    },
                    {
                        id: 2,
                        time: 100,
                        timeEnd: 120,
                        request: {
                            method: 'GET',
                            url: 'https://example.com',
                            headers: [],
                            body: null,
                        },
                        response: {
                            status: 200,
                            statusText: 'OK',
                            headers: [
                                {
                                    name: 'Content-Type',
                                    value: 'text/html',
                                },
                            ],
                            body: '<!DOCTYPE html>\n<html>\n</html>\n',
                        },
                    },
                ],
            }),
        ).toMatchSnapshot();
    });

    test('request with same name as collection', function () {
        expect(
            format({
                requests: [
                    {
                        collection: 'A',
                        title: 'B',
                        method: 'GET',
                        url: 'https://www.example.com',
                        headers: [],
                        body: null,
                        variables: {},
                        id: 2,
                    },
                    {
                        collection: 'A / B',
                        title: 'C',
                        method: 'GET',
                        url: 'https://www.example.com',
                        headers: [],
                        body: null,
                        variables: {},
                        id: 1,
                    },
                ],
                historyEntries: [],
            }),
        ).toMatchSnapshot();
    });
});

describe('parse', function () {
    test('parses part of Postman Echo collection', function () {
        const collectionJson = `{
            "info": {
                "name": "Postman Echo",
                "schema": "https://schema.getpostman.com/json/collection/v2.0.0/collection.json"
            },
            "item": [
                {
                    "name": "Auth: Digest",
                    "item": [
                        {
                            "name": "DigestAuth Request",
                            "request": {
                                "url": "https://postman-echo.com/digest-auth",
                                "method": "GET",
                                "header": [],
                                "body": {
                                    "mode": "formdata",
                                    "formdata": [
                                        {
                                            "key": "code",
                                            "value": "xWnkliVQJURqB2x1",
                                            "type": "text"
                                        },
                                        {
                                            "key": "grant_type",
                                            "value": "authorization_code",
                                            "type": "text"
                                        },
                                        {
                                            "key": "redirect_uri",
                                            "value": "https://www.getpostman.com/oauth2/callback",
                                            "type": "text"
                                        },
                                        {
                                            "key": "client_id",
                                            "value": "abc123",
                                            "type": "text"
                                        },
                                        {
                                            "key": "client_secret",
                                            "value": "ssh-secret",
                                            "type": "text"
                                        }
                                    ]
                                }
                            }
                        },
                        {
                            "name": "DigestAuth Success",
                            "request": {
                                "url": "https://postman-echo.com/digest-auth",
                                "method": "GET",
                                "header": [
                                    {
                                        "key": "Authorization",
                                        "value": "Digest username=\\"postman\\", realm=\\"Users\\", nonce=\\"ni1LiL0O37PRRhofWdCLmwFsnEtH1lew\\", uri=\\"/digest-auth\\", response=\\"254679099562cf07df9b6f5d8d15db44\\", opaque=\\"\\""
                                    }
                                ],
                                "body": {}
                            }
                        }
                    ]
                }
            ]
        }`;

        expect(
            parse(collectionJson, {
                collectionPrefix: '',
            }),
        ).toMatchSnapshot();
    });

    test('parses nested folders and rester ids', function () {
        const collectionJson = `{
            "info": {
                "name": "Postman Echo",
                "schema": "https://schema.getpostman.com/json/collection/v2.0.0/collection.json"
            },
            "item": [
                {
                    "name": "A",
                    "item": [
                        {
                            "name": "B",
                            "item": [
                                {
                                    "name": "Food",
                                    "request": {
                                        "url": "https://example.com",
                                        "method": "POST",
                                        "header": [],
                                        "body": {
                                            "mode": "urlencoded",
                                            "urlencoded": [
                                                {
                                                    "key": "fruit",
                                                    "value": "banana"
                                                },
                                                {
                                                    "key": "treat",
                                                    "value": "chocolate",
                                                    "disabled": true
                                                }
                                            ]
                                        }
                                    }
                                }
                            ]
                        }
                    ]
                }
            ]
        }`;

        expect(
            parse(collectionJson, {
                collectionPrefix: 'Import',
            }),
        ).toMatchSnapshot();
    });
});
