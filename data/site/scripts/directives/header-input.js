'use strict';

angular.module('app')
    .directive('headerInput', [function () {
        
        var REQUEST_HEADERS = [
            'Accept',
            'Accept-Charset',
            'Accept-Encoding',
            'Accept-Language',
            'Authorization',
            'Cache-Control',
            'Connection',
            'Content-Type',
            'Date',
            'Expect',
            'From',
            'Host',
            'If-Match',
            'If-Modified-Since',
            'If-None-Match',
            'If-Range',
            'If-Unmodified-Since',
            'Max-Forwards',
            'Pragma',
            'Proxy-Authorization',
            'Range',
            'Referer',
            'TE',
            'Trailer',
            'Transfer-Encoding',
            'Upgrade',
            'User-Agent',
            'Via',
            'Warning'
        ];

        return {
            restrict: 'E',
            require: 'ngModel',
            scope: true,
            template: `
                <div layout="row" layout-align="space-between center" class="input-row" ng-repeat="header in headers">
                    <md-autocomplete flex
                        md-selected-item="header.$$selectedItem"
                        md-search-text="header.name"
                        md-items="item in querySearch(header.name)"
                        md-item-text="item"
                        md-floating-label="Name"
                        md-search-text-change="onHeaderUpdated()">
                        <md-item-template>
                            <span md-highlight-text="header.name" md-highlight-flags="gi">{{item}}</span>
                        </md-item-template>
                    </md-autocomplete>

                    <md-input-container flex>
                        <label>Value</label>
                        <input type="text" ng-model="header.value" ng-change="onHeaderUpdated()">
                    </md-input-container>

                    <md-button class="md-icon-button" ng-show="headers.length > 1" ng-click="removeHeader(header)">
                        <md-icon>remove</md-icon>
                    </md-button>
                </div>
            `,
            link: function postLink(scope, element, attrs, ngModelCtrl) {
                scope.headers = [];

                ngModelCtrl.$render = function () {
                    scope.headers = ngModelCtrl.$viewValue || [];
                    ensureOneEmptyHeaderEntry();
                };

                scope.onHeaderUpdated = function () {
                    ngModelCtrl.$setViewValue(scope.headers.filter(h => h.name));
                    ensureOneEmptyHeaderEntry();
                };

                scope.removeHeader = function (header) {
                    var index = scope.headers.indexOf(header);
                    if (index > -1) {
                        scope.headers.splice(index, 1);
                    }

                    scope.onHeaderUpdated();
                };

                function ensureOneEmptyHeaderEntry() {
                    if (scope.headers.filter(h => !h.name && !h.value).length === 0) {
                        scope.headers.push({
                            name: '',
                            value: ''
                        });
                    }
                }
            },
            controller: function ($scope) {
                $scope.querySearch = function (query) {
                    if (!query) return [];

                    var lowercaseQuery = angular.lowercase(query);
                    return REQUEST_HEADERS.filter(h => angular.lowercase(h).indexOf(lowercaseQuery) > -1);
                };
            }
        };

    }]);
