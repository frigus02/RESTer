'use strict';

angular.module('app')
    .controller('DialogQuickOpenCtrl', ['$scope', '$mdDialog', '$rester', '$state',
        function ($scope, $mdDialog, $rester, $state) {

            let items = [];
            let initialLoadingPromise = $rester.getRequests().then(requests => {
                items.push(...requests.map(r => ({
                    title: `${r.collection} / ${r.title}`,
                    url: `${r.method} ${r.url}`,
                    data: r
                })));

                initialLoadingPromise = null;
            });

            function doQueryItems(query) {
                items.forEach(i => {
                    i.score = Math.max(i.title.score(query), i.url.score(query));
                    i.formattedScore = Math.round(i.score * 1000);
                });

                return items
                    .filter(i => i.score > 0.0)
                    .sort((a, b) => b.score - a.score);
            }

            function doOpenItem(item) {
                $state.go('main.request.existing', {id: item.data.id});
            }

            $scope.searchText = '';
            $scope.queryItems = function (query) {
                if (initialLoadingPromise) {
                    return initialLoadingPromise.then(function () {
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
