/* eslint-env node, jest */

import {
    clone,
    cloneDeep,
    sample,
    randInt
} from './util.js';

jest.mock('./rester.js');
jest.mock('./variables.js');

describe('clone', function () {
    test('returns a shallow clone of an array', function () {
        const original = [1, 'test', [3, 4], { 'foo': 'bar' }];
        const result = clone(original);
        expect(result).toEqual(original);
        expect(result).not.toBe(original);
        expect(result[2]).toBe(original[2]);
    });

    test('returns a shallow clone of an object', function () {
        const original = { 'foo': 'bar', 'arr': [1, 2] };
        const result = clone(original);
        expect(result).toEqual(original);
        expect(result).not.toBe(original);
        expect(result.arr).toBe(original.arr);
    });
});

describe('cloneDeep', function () {
    test('returns a deep clone of an array', function () {
        const original = [1, 'test', [3, 4], { 'foo': 'bar' }];
        const result = cloneDeep(original);
        expect(result).toEqual(original);
        expect(result).not.toBe(original);
        expect(result[2]).not.toBe(original[2]);
    });

    test('returns a deep clone of an object', function () {
        const original = { 'foo': 'bar', 'arr': [1, 2] };
        const result = cloneDeep(original);
        expect(result).toEqual(original);
        expect(result).not.toBe(original);
        expect(result.arr).not.toBe(original.arr);
    });
});

describe('sample', function () {
    test('to return a random element from the specified array', function () {
        const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const result = sample(data);
        expect(data).toContain(result);
    });
});

describe('randInt', function () {
    test('to return a random number within the specified range', function () {
        const result = randInt(42, 84);
        expect(result).toBeGreaterThanOrEqual(42);
        expect(result).toBeLessThanOrEqual(84);
    });
});
