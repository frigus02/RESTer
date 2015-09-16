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
                scope.newHeader = { name: '', value: '' };

                scope.getPreparedHeaders = function () {
                    var preparedHeaders = [];
                    preparedHeaders.push(...scope.headers);
                    preparedHeaders.push(scope.newHeader);
                    return preparedHeaders;
                };

                scope.$watch('newHeader', function () {
                    if (scope.newHeader.name || scope.newHeader.value) {
                        scope.headers.push(scope.newHeader);
                        scope.newHeader = { name: '', value: '' };
                    }
                }, true);

                scope.removeHeader = function (header) {
                    var index = scope.headers.indexOf(header);
                    if (index > -1) {
                        scope.headers.splice(index, 1);
                    }
                };
            },
            controller: function ($scope) {
                $scope.querySearchHeader = function (query) {
                    if (!query) return [];

                    var lowercaseQuery = angular.lowercase(query);
                    return REQUEST_HEADERS.filter(h => angular.lowercase(h.name).indexOf(lowercaseQuery) > -1);
                };

                $scope.querySearchHeaderValue = function (headerName, query) {
                    if (!headerName || !query) return [];

                    var requestHeader = REQUEST_HEADERS.find(h => angular.lowercase(h.name) === angular.lowercase(headerName));
                    if (!requestHeader || !requestHeader.suggestedValues) return [];

                    var lowercaseQuery = angular.lowercase(query);
                    return requestHeader.suggestedValues.filter(v => angular.lowercase(v).indexOf(lowercaseQuery) > -1);
                };
            }
        };

    }]);
