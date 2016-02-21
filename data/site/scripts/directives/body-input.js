'use strict';

angular.module('app')
    .directive('bodyInput', [function () {

        return {
            restrict: 'E',
            scope: {
                headers: '=',
                body: '='
            },
            templateUrl: 'views/directives/body-input.html',
            controller: function ($scope) {
                $scope.settings = {
                    setContentType: true
                };

                $scope.options = [
                    {
                        title: 'Plain',
                        inputType: 'codemirror',
                        codeMirrorMode: {}
                    },
                    {
                        title: 'JSON',
                        inputType: 'codemirror',
                        contentType: 'application/json',
                        codeMirrorMode: {name: 'javascript', json: true},
                        isActive () {
                            return getContentType().includes('json');
                        }
                    },
                    {
                        title: 'XML',
                        inputType: 'codemirror',
                        contentType: 'application/xml',
                        codeMirrorMode: {name: 'xml'},
                        isActive () {
                            return getContentType().includes('xml');
                        }
                    },
                    {
                        title: 'Form',
                        inputType: 'form',
                        contentType: 'application/x-www-form-urlencoded',
                        isActive () {
                            return getContentType().includes('x-www-form-urlencoded');
                        }
                    }
                ];

                $scope.activeOption = $scope.options[0];

                $scope.activateOption = function (option) {
                    $scope.activeOption = option;
                    if ($scope.settings.setContentType && option.contentType) {
                        setContentType(option.contentType);
                    }
                };

                let codeMirrorEditor;

                $scope.getCodeMirrorOptions = function () {
                    return {
                        mode: $scope.activeOption.codeMirrorMode,
                        indentUnit: 4,
                        theme: 'darkula',
                        onLoad (editor) {
                            codeMirrorEditor = editor;
                        }
                    };
                };

                $scope.isCodeMirrorScrolling = function () {
                    if (!codeMirrorEditor) return false;

                    let scrollInfo = codeMirrorEditor.getScrollInfo();
                    return scrollInfo.height > scrollInfo.clientHeight;
                };

                $scope.$watch(() => getContentType(), function () {
                    $scope.activeOption = $scope.options[0];

                    for (let option of $scope.options) {
                        if (option.isActive && option.isActive()) {
                            $scope.activeOption = option;
                        }
                    }
                });


                // Fix for ui-codemirror, which can not write directly into a scope variable:
                $scope.bodyWrapper = {value: ''};
                $scope.$watch('body', value => { $scope.bodyWrapper.value = value; });
                $scope.$watch('bodyWrapper.value', value => { $scope.body = value; });


                function getContentType() {
                    let contentTypeHeader = $scope.headers.find(h => angular.lowercase(h.name) === 'content-type'),
                        contentType = contentTypeHeader && contentTypeHeader.value;

                    return angular.lowercase(contentType) || '';
                }

                function setContentType(contentType) {
                    let contentTypeHeader = $scope.headers.find(h => angular.lowercase(h.name) === 'content-type');
                    if (contentTypeHeader) {
                        contentTypeHeader.value = contentType;
                    } else {
                        $scope.headers.push({
                            name: 'Content-Type',
                            value: contentType
                        });
                    }
                }

            }
        };

    }]);
