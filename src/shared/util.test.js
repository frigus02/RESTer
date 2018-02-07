/* eslint-env node, jest */

import {
    clone,
    cloneDeep,
    randInt,
    sample,
    sortedIndexOf
} from './util.js';

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
        expect(sortedIndexOf([
            { name: 'apple' },
            { name: 'grape' },
            { name: 'orange' }
        ], { name: 'melon' }, x => x.name)).toBe(2);
    });

    test('finds array in the middle', function () {
        expect(sortedIndexOf([
            ['comments', 'folder'],
            ['posts', 'folder'],
            ['posts', 'item']
        ], ['comments,a', 'item'])).toBe(1);
    });
});

