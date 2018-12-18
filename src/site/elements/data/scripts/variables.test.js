/* eslint-env node, jest */

import {
    providedValues,
    extract,
    replace,
    replaceWithoutProvidedValues
} from './variables.js';
import mockProviderEnv from './variables-provider-env.js';

jest.mock('./rester.js');
jest.mock('./variables-provider-env.js');

const fakeObject = {
    title: 'Post by ID',
    url: 'https://{$env.host}/api/posts/{id}',
    headers: [
        {
            name: 'Authorization',
            value: 'Bearer {token}'
        }
    ]
};

function setProviderEnvValues(values) {
    mockProviderEnv.values = values;
    mockProviderEnv.e.dispatchEvent(
        new CustomEvent('valuesChanged', {
            detail: mockProviderEnv.values
        })
    );
}

describe('providedValues', function() {
    test('contains aggregated values from all providers', function() {
        expect({}).toEqual(providedValues);

        setProviderEnvValues({
            host: 'example.com',
            port: 443
        });

        expect(Object.keys(providedValues).length).toEqual(2);
        expect(providedValues['$env.host']).toEqual('example.com');
        expect(providedValues['$env.port']).toEqual(443);
    });
});

describe('extract', function() {
    test('aggregates placeholders from given object', function() {
        const variables = extract(fakeObject);

        expect(variables.length).toEqual(3);
        expect(variables).toEqual(['$env.host', 'id', 'token']);
    });
});

describe('replace', function() {
    test('replaces all variables with their values', function() {
        setProviderEnvValues({
            host: 'example.com'
        });

        const values = {
            id: 12
        };
        const usedValues = {};
        const newObject = replace(fakeObject, values, usedValues);

        expect(newObject).toEqual({
            title: 'Post by ID',
            url: 'https://example.com/api/posts/12',
            headers: [
                {
                    name: 'Authorization',
                    value: 'Bearer {token}'
                }
            ]
        });
        expect(usedValues).toEqual({
            '$env.host': 'example.com',
            id: 12
        });
    });

    test('prefers provided values over local values', function() {
        setProviderEnvValues({
            host: 'example.com'
        });

        const values = {
            '$env.host': 'mycoolsite.com',
            id: 12
        };
        const newObject = replace(fakeObject, values);

        expect(newObject).toEqual({
            title: 'Post by ID',
            url: 'https://example.com/api/posts/12',
            headers: [
                {
                    name: 'Authorization',
                    value: 'Bearer {token}'
                }
            ]
        });
    });

    test('leaves variables without or with empty value untouched', function() {
        setProviderEnvValues({
            host: 'example.com'
        });

        const values = {
            id: ''
        };
        const usedValues = {};
        const newObject = replace(fakeObject, values, usedValues);

        expect(newObject).toEqual({
            title: 'Post by ID',
            url: 'https://example.com/api/posts/{id}',
            headers: [
                {
                    name: 'Authorization',
                    value: 'Bearer {token}'
                }
            ]
        });
        expect(usedValues).toEqual({
            '$env.host': 'example.com'
        });
    });
});

describe('replaceWithoutProvidedValues', function() {
    test('does not use provided values', function() {
        setProviderEnvValues({
            host: 'example.com'
        });

        const values = {
            '$env.host': 'mycoolsite.com',
            id: 12
        };
        const newObject = replaceWithoutProvidedValues(fakeObject, values);

        expect(newObject).toEqual({
            title: 'Post by ID',
            url: 'https://mycoolsite.com/api/posts/12',
            headers: [
                {
                    name: 'Authorization',
                    value: 'Bearer {token}'
                }
            ]
        });
    });
});
