/* eslint-env node, jest */

import { getFilenameFromContentDispositionHeader } from './request.js';

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
