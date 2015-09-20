'use strict';

angular.module('app')
    .controller('DialogQuickOpenCtrl', ['$scope', '$mdDialog', '$data', '$state', '$filter', '$q',
        function ($scope, $mdDialog, $data, $state, $filter, $q) {

            var items = [];
            var initialLoadingPromise = $data.getRequests().then(requests => {
                items.push(...requests.map(r => ({
                    title: `${r.collection} / ${r.title}`,
                    data: r
                })));

                initialLoadingPromise = null;
            });

            function doQueryItems(query) {
                return _(items)
                    .forEach(i => {
                        i.score = LiquidMetal.score(i.title, query);
                        i.formattedScore = Math.round(i.score * 1000);
                    })
                    .filter(i => i.score > 0.0)
                    .sortBy('-score')
                    .value();
            }

            function doOpenItem(item) {
                if (item.data instanceof $data.Request) {
                    $state.go('main.request.existing', {id: item.data.id});
                }
            }

            $scope.searchText = '';
            $scope.queryItems = function (query) {
                if (initialLoadingPromise) {
                    return initialLoadingPromise.then(function() {
                        return doQueryItems(query);
                    });
                } else {
                    return doQueryItems(query);
                }
            };

            $scope.openItem = function (item) {
                $mdDialog.hide();
                if (item) {
                    doOpenItem(item);
                }
            };

        }
    ]);
