'use strict';

angular.module('app')
    .directive('inputSuggestions', ['$mdConstant', '$q', '$timeout', '$templateRequest', '$compile', function ($mdConstant, $q, $timeout, $templateRequest, $compile) {

        return {
            restrict: 'A',
            require: ['^mdInputContainer', 'ngModel'],
            link: function ($scope, element, attr, ctrls) {
                const ngModelCtrl = ctrls[1];

                let inputFocused = false;
                let childElement;
                let childElementPositioned = false;
                let childScope = $scope.$new(true);
                let parentElement = element;
                while (parentElement[0].nodeName !== 'MD-CONTENT' && parentElement[0].nodeName !== 'MD-DIALOG-CONTENT') {
                    parentElement = parentElement.parent();
                }

                childScope.visible = true;
                childScope.maxVisibleItems = parseFloat(attr.inputSuggestionsMaxVisible) || 4.7;
                childScope.items = [];
                childScope.inputValue = ngModelCtrl.$viewValue;
                childScope.selectedIndex = 0;

                function onFocus() {
                    inputFocused = true;

                    if (!childElementPositioned) {
                        let elementBcr = element[0].getBoundingClientRect();
                        let parentBcr = parentElement[0].getBoundingClientRect();
                        childElement.css({
                            top: `${elementBcr.top - parentBcr.top + parentElement[0].scrollTop}px`,
                            left: `${elementBcr.left - parentBcr.left}px`,
                            width: `${elementBcr.width}px`
                        });
                        childElementPositioned = true;
                    }

                    queryItems();
                }

                function onBlur() {
                    inputFocused = false;
                    $timeout(() => {
                        if (!inputFocused) {
                            childScope.visible = false;
                        }
                    }, 100);
                }

                function onKeyDown(event) {
                    switch (event.keyCode) {
                        case $mdConstant.KEY_CODE.DOWN_ARROW:
                            event.stopPropagation();
                            event.preventDefault();
                            childScope.selectedIndex = Math.min(childScope.selectedIndex + 1, childScope.items.length - 1);
                            childScope.$applyAsync();
                            updateScroll(false);
                            break;
                        case $mdConstant.KEY_CODE.UP_ARROW:
                            event.stopPropagation();
                            event.preventDefault();
                            childScope.selectedIndex = Math.max(childScope.selectedIndex - 1, 0);
                            childScope.$applyAsync();
                            updateScroll(true);
                            break;
                        case $mdConstant.KEY_CODE.TAB:
                            if (childScope.visible) {
                                childScope.setInputValue(childScope.items[childScope.selectedIndex]);
                            }

                            break;
                        case $mdConstant.KEY_CODE.ENTER:
                            if (childScope.visible) {
                                event.stopPropagation();
                                event.preventDefault();

                                childScope.setInputValue(childScope.items[childScope.selectedIndex]);
                                childScope.$applyAsync();
                            }

                            break;
                        case $mdConstant.KEY_CODE.ESCAPE:
                            event.stopPropagation();
                            event.preventDefault();
                            childScope.visible = false;
                            childScope.$applyAsync();
                            break;
                    }
                }

                function queryItems() {
                    childScope.inputValue = ngModelCtrl.$viewValue;
                    $q.resolve($scope.$eval(attr.inputSuggestions, {searchTerm: childScope.inputValue})).then(items => {
                        childScope.items = items;
                        if (inputFocused) {
                            childScope.visible = true;
                        }
                    });
                }

                function updateScroll(alignTop) {
                    let item = childElement.find('li').eq(childScope.selectedIndex)[0];
                    if (!item) return;

                    let list = item.parentElement;
                    if (item.offsetTop >= list.scrollTop &&
                        item.offsetTop + item.offsetHeight <= list.scrollTop + list.clientHeight) {
                        // Element is already in view. Nothing to do.
                        return;
                    }

                    if (alignTop) {
                        list.scrollTop = item.offsetTop;
                    } else {
                        list.scrollTop = item.offsetTop + item.offsetHeight - list.clientHeight;
                    }
                }

                function destroy() {
                    element.off('keydown', onKeyDown);
                    element.off('focus', onFocus);
                    element.off('blur', onBlur);
                    childElement.remove();
                    childScope.$destroy();
                }

                childScope.setInputValue = function (value) {
                    element.val(value);
                    ngModelCtrl.$setViewValue(value);
                    childScope.visible = false;
                };

                element.attr('autocomplete', 'off');
                element.on('keydown', onKeyDown);
                element.on('focus', onFocus);
                element.on('blur', onBlur);
                ngModelCtrl.$viewChangeListeners.push(queryItems);

                $templateRequest('views/directives/input-suggestions.html').then(template => {
                    childElement = angular.element('<div>').html(template.trim()).contents();
                    $compile(childElement)(childScope);

                    parentElement.append(childElement);
                });

                $scope.$on('$destroy', destroy);
            }
        };

    }]);
