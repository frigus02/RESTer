'use strict';

angular.module('app')
    .directive('headerInput', [function () {

        var COMMON_MIME_TYPES = [
            'application/json',
            'application/x-www-form-urlencoded',
            'application/xhtml+xml',
            'application/xml',
            'text/html',
            'text/plain',
            'text/xml'
        ];
        
        var COMMON_CHARSETS = [
            'utf-8',
            'iso-8859-1'
        ];

        var REQUEST_HEADERS = [
            { name: 'Accept', suggestedValues: COMMON_MIME_TYPES },
            { name: 'Accept-Charset', suggestedValues: COMMON_CHARSETS },
            { name: 'Accept-Encoding', suggestedValues: ['gzip', 'deflate'] },
            { name: 'Accept-Language' },
            { name: 'Authorization' },
            { name: 'Cache-Control', suggestedValues: ['no-cache'] },
            { name: 'Connection', suggestedValues: ['close', 'keep-alive'] },
            { name: 'Content-Type', suggestedValues: COMMON_MIME_TYPES },
            { name: 'Date' },
            { name: 'Expect' },
            { name: 'From' },
            { name: 'Host' },
            { name: 'If-Match' },
            { name: 'If-Modified-Since' },
            { name: 'If-None-Match' },
            { name: 'If-Range' },
            { name: 'If-Unmodified-Since' },
            { name: 'Max-Forwards' },
            { name: 'Pragma' },
            { name: 'Proxy-Authorization' },
            { name: 'Range' },
            { name: 'Referer' },
            { name: 'TE' },
            { name: 'Trailer' },
            { name: 'Transfer-Encoding' },
            { name: 'Upgrade' },
            { name: 'User-Agent' },
            { name: 'Via' },
            { name: 'Warning' },
        ];

        return {
            restrict: 'E',
            scope: {
                headers: '='
            },
            templateUrl: 'views/directives/header-input.html',
            link: function postLink(scope, element, attrs) {
                scope.headersArray = [];

                scope.$watch('headers', function () {
                    scope.headersArray = _(scope.headers || {})
                        .pairs()
                        .sortBy(0)
                        .map(h => {
                            return {
                                name: h[0],
                                value: h[1],
                                $$selectedHeader: REQUEST_HEADERS
                                    .filter(rh => angular.lowercase(rh.name) === angular.lowercase(h[0]))
                                    .pop()
                            };
                        })
                        .value();
                    ensureOneEmptyHeaderEntry();
                }, true);

                scope.onHeaderUpdated = function () {
                    scope.headers = _(scope.headersArray)
                        .filter(h => h.name)
                        .map(h => ([h.name, h.value]))
                        .zipObject()
                        .value();
                    ensureOneEmptyHeaderEntry();
                };

                scope.removeHeader = function (header) {
                    var index = scope.headersArray.indexOf(header);
                    if (index > -1) {
                        scope.headersArray.splice(index, 1);
                    }

                    scope.onHeaderUpdated();
                };

                function ensureOneEmptyHeaderEntry() {
                    if (scope.headersArray.filter(h => !h.name).length === 0) {
                        scope.headersArray.push({
                            name: '',
                            value: ''
                        });
                    }
                }
            },
            controller: function ($scope) {
                $scope.querySearchHeader = function (query) {
                    if (!query) return [];

                    var lowercaseQuery = angular.lowercase(query);
                    return REQUEST_HEADERS.filter(h => angular.lowercase(h.name).indexOf(lowercaseQuery) > -1);
                };

                $scope.querySearchHeaderValue = function (header, query) {
                    if (!header || !header.suggestedValues || !query) return [];

                    var lowercaseQuery = angular.lowercase(query);
                    return header.suggestedValues.filter(v => angular.lowercase(v).indexOf(lowercaseQuery) > -1);
                };
            }
        };

    }]);
