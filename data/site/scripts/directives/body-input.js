'use strict';

angular.module('app')
    .directive('bodyInput', ['$error', function ($error) {

        return {
            restrict: 'E',
            scope: {
                headers: '=',
                body: '='
            },
            templateUrl: 'views/directives/body-input.html',
            controller: function ($scope) {

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
                        })
                    }
                }

                $scope.options = [
                    {
                        title: 'Plain',
                        inputType: 'codemirror',
                        codeMirrorMode: {}
                    },
                    {
                        title: 'JSON',
                        inputType: 'codemirror',
                        codeMirrorMode: {name: 'javascript', json: true},
                        isActive() {
                            return getContentType().includes('json');
                        },
                        onActivate() {
                            setContentType('application/json');
                        }
                    },
                    {
                        title: 'XML',
                        inputType: 'codemirror',
                        codeMirrorMode: {name: 'xml'},
                        isActive() {
                            return getContentType().includes('xml');
                        },
                        onActivate() {
                            setContentType('application/xml');
                        }
                    },
                    {
                        title: 'Form',
                        inputType: 'form',
                        isActive() {
                            return getContentType().includes('x-www-form-urlencoded');
                        },
                        onActivate() {
                            setContentType('application/x-www-form-urlencoded');
                        }
                    }
                ];

                $scope.activeOption = $scope.options[0];

                $scope.activateOption = function (option) {
                    $scope.activeOption = option;
                    if (option.onActivate) {
                        option.onActivate();
                    }
                };

                let codeMirrorEditor;

                $scope.getCodeMirrorOptions = function () {
                    return {
                        mode: $scope.activeOption.codeMirrorMode,
                        indentUnit: 4,
                        theme: 'darkula',
                        onLoad(editor) {
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

            }
        };

    }]);
