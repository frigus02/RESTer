'use strict';

angular.module('app')
    .controller('DialogHighlightCodeChangeLanguageCtrl', ['$scope', '$mdDialog', 'currentLanguage',
        function ($scope, $mdDialog, currentLanguage) {

            $scope.languages = [
                { name: 'plain', label: 'Plain text' , aliases: [] },
                { name: 'css', label: 'CSS', aliases: [] },
                { name: 'xml', label: 'HTML, XML', aliases: ['xml', 'html', 'xhtml', 'rss', 'atom', 'xjb', 'xsd', 'xsl', 'plist'] },
                { name: 'handlebars', label: 'Handlebars', aliases: ['handlebars', 'hbs', 'html.hbs', 'html.handlebars'] },
                { name: 'http', label: 'HTTP', aliases: ['http', 'https'] },
                { name: 'javascript', label: 'JavaScript', aliases: ['javascript', 'js', 'jsx'] },
                { name: 'json', label: 'JSON', aliases: [] },
                { name: 'less', label: 'Less', aliases: [] },
                { name: 'markdown', label: 'Markdown', aliases: ['markdown', 'md', 'mkdown', 'mkd'] }
            ];

            $scope.selectedLanguage = $scope.languages.find(lang =>
                lang.name === currentLanguage ||
                lang.aliases.includes(currentLanguage));

            $scope.selectLanguage = function (lang) {
                $mdDialog.hide(lang.name);
            };

        }
    ]);
