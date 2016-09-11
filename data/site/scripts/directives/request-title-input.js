'use strict';

angular.module('app')
    .directive('requestTitleInput', ['$mdConstant', '$rester', function ($mdConstant, $rester) {

        return {
            restrict: 'E',
            scope: {
                collection: '=',
                title: '='
            },
            templateUrl: 'views/directives/request-title-input.html',
            link: function ($scope, $element) {
                const input = $element.find('input')[0];

                function onKeyDown(event) {
                    const caretPos = input.selectionStart,
                          isSelection = input.selectionStart !== input.selectionEnd,
                          value = input.value;

                    if (event.keyCode === $mdConstant.KEY_CODE.BACKSPACE) {
                        if (!isSelection && value.substr(caretPos - 3, 3) === ' / ') {
                            input.value = value.substr(0, caretPos - 2) + value.substr(caretPos);
                            input.setSelectionRange(caretPos - 2, caretPos - 2);
                        }
                    } else if (event.keyCode === $mdConstant.KEY_CODE.DELETE) {
                        if (!isSelection && value.substr(caretPos, 3) === ' / ') {
                            input.value = value.substr(0, caretPos) + value.substr(caretPos + 2);
                            input.setSelectionRange(caretPos, caretPos);
                        }
                    } else if (event.key === '/') {
                        let strToInsert = ' / ',
                            newValue = value.substring(0, input.selectionStart) + value.substring(input.selectionEnd);

                        if (newValue.substr(caretPos - 1, 1) === ' ') {
                            strToInsert = strToInsert.trimLeft();
                        }
                        if (newValue.substr(caretPos, 1) === ' ') {
                            strToInsert = strToInsert.trimRight();
                        }

                        input.value = newValue.substr(0, caretPos) + strToInsert + newValue.substr(caretPos);
                        input.setSelectionRange(caretPos + strToInsert.length, caretPos + strToInsert.length);
                        event.preventDefault();

                        $scope.$apply(() => {
                            $scope.value = input.value;
                        });
                    }
                }

                function destroy() {
                    input.removeEventListener('keydown', onKeyDown);
                }

                input.addEventListener('keydown', onKeyDown);

                $scope.$on('$destroy', destroy);
            },
            controller: function ($scope) {
                $scope.value = '';

                let knownCollection,
                    knownTitle;

                $scope.$watchGroup(['collection', 'title'], function () {
                    if ($scope.collection !== knownCollection ||
                        $scope.title !== knownTitle) {
                        knownCollection = $scope.collection;
                        knownTitle = $scope.title;

                        if (knownTitle && knownCollection) {
                            $scope.value = `${$scope.collection} / ${$scope.title}`;
                        } else {
                            $scope.value = '';
                        }
                    }
                });

                $scope.$watch('value', function () {
                    const parts = $scope.value.split('/');

                    if (parts.length > 1) {
                        knownTitle = parts.pop().trim();
                    } else {
                        knownTitle = '';
                    }

                    knownCollection = parts.map(p => p.trim()).filter(p => p).join(' / ');

                    $scope.collection = knownCollection;
                    $scope.title = knownTitle;
                });


                let collections = null;

                function getFilteredCollections() {
                    if (!$scope.value) return collections;

                    let lowercaseQuery = angular.lowercase($scope.value);
                    return collections.filter(c => angular.lowercase(c).indexOf(lowercaseQuery) > -1);
                }

                $scope.queryCollections = function () {
                    if (collections === null) {
                        return $rester.getRequestCollections().then(result => {
                            collections = result.map(c => c + ' / ');

                            return getFilteredCollections();
                        });
                    } else {
                        return getFilteredCollections();
                    }
                };
            }
        };

    }]);
