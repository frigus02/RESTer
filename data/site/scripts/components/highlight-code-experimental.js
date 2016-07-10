'use strict';

angular.module('app')
    .component('highlightCodeExperimental', {
        bindings: {
            code: '<',
            language: '<'
        },
        templateUrl: 'views/components/highlight-code-experimental.html',
        controller: function () {

            const ctrl = this;
            const codeMirrorModes = {
                'json': {name: 'javascript', json: true},
                'xml': {name: 'xml'}
            };

            let codeMirrorEditor;

            ctrl.prettyPrint = true;

            ctrl.codeMirrorOptions = {
                indentUnit: 4,
                foldGutter: true,
                gutters: ['CodeMirror-foldgutter'],
                theme: 'darkula',
                readOnly: true,
                lineWrapping: false,
                onLoad (editor) {
                    codeMirrorEditor = editor;
                }
            };

            ctrl.isCodeMirrorScrolling = function () {
                if (!codeMirrorEditor) return false;

                let scrollInfo = codeMirrorEditor.getScrollInfo();
                return scrollInfo.height > scrollInfo.clientHeight;
            };

            function isPrettyPrintSupported(language) {
                return language === 'json' || language === 'xml';
            }

            function prettyPrint(code, language) {
                if (language === 'json') {
                    return vkbeautify.json(code, 4);
                } else if (language === 'xml') {
                    return vkbeautify.xml(code, 4);
                }
            }

            ctrl.$onChanges = function (changes) {
                if (changes.code) {
                    if (isPrettyPrintSupported(ctrl.language)) {
                        ctrl.codeFormatted = prettyPrint(ctrl.code, ctrl.language);
                        ctrl.prettyPrint = true;
                    } else {
                        ctrl.codeFormatted = undefined;
                        ctrl.prettyPrint = false;
                    }
                }

                if (changes.language) {
                    ctrl.codeMirrorOptions.mode = codeMirrorModes[ctrl.language];
                }
            };

        }
    });
