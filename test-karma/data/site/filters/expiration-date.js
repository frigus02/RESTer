'use strict';

describe('filter: expirationDate', function () {
    beforeEach(module('app'));

    let $filter;
    let spyDateFilter;

    beforeEach(function () {
        spyDateFilter = jasmine.createSpy().and.returnValue('<formatteddate>');

        module({
            dateFilter: spyDateFilter
        });
    });

    beforeEach(inject(function (_$filter_) {
        $filter = _$filter_;
    }));


    it('returns "Never expires" when given null', function () {
        let expirationDate = $filter('expirationDate');

        expect(expirationDate(null)).toBe('Never expires');
    });

    it('returns "Expired" when given a date before now', function () {
        let expirationDate = $filter('expirationDate');

        expect(expirationDate(Date.now() - 1000)).toBe('Expired');
    });

    it('returns "Expired" when given a date after now', function () {
        let expirationDate = $filter('expirationDate'),
            input = Date.now() + 1000;

        expect(expirationDate(input)).toBe('Expires <formatteddate>');
        expect(spyDateFilter.calls.count()).toBe(1);
        expect(spyDateFilter.calls.argsFor(0)).toEqual([input, 'yyyy-MM-dd HH:mm:ss']);
    });
});
