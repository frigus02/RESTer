/* eslint-env node, jest */

import {
    getMatchPatterns
} from './browser-request';

describe('getMatchPatterns', function () {
    test('adds * to the end of the path', function () {
        expect(getMatchPatterns('https://example.com/callback')).toEqual([
            'https://example.com/callback*'
        ]);
    });

    test('ensures a path is at least a slash', function () {
        expect(getMatchPatterns('https://example.com')).toEqual([
            'https://example.com/*'
        ]);
    });

    test('when URL contains port, returns patterns both with and without port', function () {
        expect(getMatchPatterns('https://example.com:8080/callback')).toEqual([
            'https://example.com:8080/callback*',
            'https://example.com/callback*'
        ]);
    });

    test('throws error when specified URL is invalid', function () {
        expect(() => {
            getMatchPatterns('example.com');
        }).toThrow();
    });
});
