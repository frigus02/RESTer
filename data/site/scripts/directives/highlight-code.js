'use strict';

angular.module('app')
    .directive('highlightCode', ['$sanitize', '$worker', '$error', '$mdDialog', function ($sanitize, $worker, $error, $mdDialog) {

        const MAX_CODE_LENGTH = 1000000;

        return {
            restrict: 'E',
            scope: {
                code: '@',
                language: '@',
                showOptions: '@'
            },
            templateUrl: 'views/directives/highlight-code.html',
            link: function ($scope, element) {
                const iframeEl = element.find('iframe')[0];

                function clearBody(doc) {
                    while (doc.body.children.length > 0) {
                        doc.body.children[0].remove();
                    }
                }

                function createCodeElements(doc) {
                    const preEl = doc.body.appendChild(doc.createElement('pre'));
                    applyPreElementStyles(preEl);

                    const codeEl = preEl.appendChild(doc.createElement('code'));
                    applyCodeElementStyles(codeEl);
                }

                function createPreviewElements(doc) {
                    const divEl = doc.body.appendChild(doc.createElement('div'));
                    divEl.innerHTML = $sanitize($scope.code);
                }

                function applyPreElementStyles(preEl) {
                    if ($scope.settings.wrap) {
                        preEl.classList.add('wrap');
                    } else {
                        preEl.classList.remove('wrap');
                    }
                }

                function applyCodeElementStyles(codeEl) {
                    codeEl.classList.add('hljs');
                    codeEl.classList.add(`language-${$scope.highlightedLanguage}`);
                    if ($scope.settings.format && $scope.highlightedFormattedCode) {
                        codeEl.innerHTML = $sanitize($scope.highlightedFormattedCode);
                    } else {
                        codeEl.innerHTML = $sanitize($scope.highlightedCode);
                    }
                }

                function fixIFrameHeight() {
                    const doc = iframeEl.contentWindow.document;
                    iframeEl.contentWindow.setTimeout(() => {
                        iframeEl.style.height = `${doc.body.clientHeight}px`;
                    });
                }

                $scope.update = function () {
                    const doc = iframeEl.contentWindow.document;

                    clearBody(doc);
                    if ($scope.isPreviewSupported && $scope.settings.preview) {
                        createPreviewElements(doc);
                    } else {
                        createCodeElements(doc);
                    }

                    fixIFrameHeight();
                };

                $scope.$watch('settings.format', () => {
                    const doc = iframeEl.contentWindow.document;
                    const codeEl = doc.querySelector('code');

                    if (codeEl) {
                        applyCodeElementStyles(codeEl);
                        fixIFrameHeight();
                    }
                });

                $scope.$watch('settings.wrap', () => {
                    const doc = iframeEl.contentWindow.document;
                    const preEl = doc.querySelector('pre');

                    if (preEl) {
                        applyPreElementStyles(preEl);
                        fixIFrameHeight();
                    }
                });

                $scope.$watch('settings.preview', () => {
                    if ($scope.isPreviewSupported) {
                        $scope.update();
                    }
                });
            },
            controller: function ($scope) {
                $scope.settings = {
                    format: true,
                    wrap: true,
                    preview: false
                };
                $scope.isHighlighting = false;
                $scope.highlightedLanguage = '';
                $scope.highlightedCode = '';
                $scope.highlightedFormattedCode = '';
                $scope.isPreviewSupported = false;
                $scope.isCodeTooLarge = false;

                let lastHighlightCodeWorker;
                let highlightCodeDebounced = _.debounce(() => {
                    lastHighlightCodeWorker = $worker.HighlightCode.run({
                        language: $scope.highlightedLanguage,
                        code: $scope.code
                    });
                    lastHighlightCodeWorker.then(result => {
                        $scope.highlightedLanguage = result.language;
                        $scope.highlightedCode = result.highlightedCode;
                        $scope.highlightedFormattedCode = result.highlightedFormattedCode;
                        $scope.isPreviewSupported = result.language === 'html';
                        $scope.isHighlighting = false;
                        $scope.update();
                    });
                    lastHighlightCodeWorker.catch(error => {
                        $error.show(error);
                        $scope.isHighlighting = false;
                        $scope.update();
                    });
                }, 300);

                $scope.$watch('code', () => initHighlighting(true, false));
                $scope.$watch('language', () => initHighlighting(false, true));

                function initHighlighting(codeChanged, languageChanged) {
                    $scope.highlightedCode = '';
                    $scope.highlightedFormattedCode = '';
                    $scope.isPreviewSupported = false;

                    if (codeChanged) {
                        $scope.isCodeTooLarge = $scope.code.length > MAX_CODE_LENGTH;
                    }

                    if (codeChanged || languageChanged) {
                        $scope.highlightedLanguage = $scope.language;
                    }

                    if (!$scope.isCodeTooLarge) {
                        $scope.isHighlighting = true;

                        if (lastHighlightCodeWorker) {
                            lastHighlightCodeWorker.cancel();
                        }

                        highlightCodeDebounced();
                    }
                }

                $scope.changeLanguage = function () {
                    $mdDialog.show({
                        templateUrl: 'views/dialogs/highlight-code-change-language.html',
                        controller: 'DialogHighlightCodeChangeLanguageCtrl',
                        clickOutsideToClose: true,
                        locals: {
                            currentLanguage: $scope.highlightedLanguage
                        }
                    }).then(newLanguage => {
                        $scope.highlightedLanguage = newLanguage;
                        initHighlighting(false, false);
                    });
                };

                $scope.forceRenderLargeCode = function () {
                    $scope.isCodeTooLarge = false;
                    initHighlighting(false, false);
                };
            }
        };

    }]);
