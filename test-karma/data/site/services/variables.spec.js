'use strict';

describe('service: $variables', function () {
    beforeEach(module('app'));

    let $variables;
    let fakeObject;
    let fakeProviders;

    beforeEach(function () {
        fakeObject = {
            title: 'Post by ID',
            url: 'https://{$env.host}/api/posts/{id}',
            headers: [
                {
                    name: 'Authorization',
                    value: 'Bearer {token}'
                }
            ]
        };

        fakeProviders = [
            {
                name: 'env',
                values: {
                    host: 'example.com',
                    port: 443
                }
            },
            {
                name: 'test',
                values: {
                    foo: 'bar'
                }
            }
        ];
    });

    beforeEach(inject(function (_$variables_) {
        $variables = _$variables_;
    }));


    describe('getProvidedValues', function () {
        it('aggregates values from all providers', function () {
            $variables.$$providers.push(...fakeProviders);

            const values = $variables.getProvidedValues();

            expect(Object.keys(values).length).toBe(3);
            expect(values['$env.host']).toBe('example.com');
            expect(values['$env.port']).toBe(443);
            expect(values['$test.foo']).toBe('bar');
        });
    });

    describe('extract', function () {
        it('aggregates values from all providers', function () {
            const variables = $variables.extract(fakeObject);

            expect(variables.length).toBe(3);
            expect(variables).toEqual(jasmine.arrayContaining([
                '$env.host',
                'id',
                'token'
            ]));
        });
    });

    describe('replace', function () {
        beforeEach(function () {
            spyOn($variables, 'getProvidedValues').and.returnValue({
                '$env.host': 'example.com'
            });
        });

        it('replaces all variables with their values', function () {
            const values = {
                id: 12
            };
            const usedValues = {};
            const newObject = $variables.replace(fakeObject, values, usedValues);

            expect($variables.getProvidedValues).toHaveBeenCalledTimes(1);
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
                'id': 12
            });
        });

        it('prefers local values over provided values', function () {
            const values = {
                '$env.host': 'mycoolsite.com',
                id: 12
            };
            const newObject = $variables.replace(fakeObject, values);

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
});
