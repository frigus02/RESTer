'use strict';

angular.module('app')
    .controller('AboutCtrl', ['$scope', '$state', '$rester',
        function ($scope, $state, $rester) {

            $state.current.data = {
                title: 'About'
            };

            let bowerComponents = /*START*/[{"name":"angular","version":"1.5.8"},{"name":"angular-animate","version":"1.5.8"},{"name":"angular-aria","version":"1.5.8"},{"name":"angular-jwt","version":"0.0.9"},{"name":"angular-material","version":"1.0.8"},{"name":"angular-messages","version":"1.5.8"},{"name":"angular-sanitize","version":"1.5.8"},{"name":"angular-ui-codemirror","version":"0.3.0"},{"name":"codemirror","version":"5.17.0"},{"name":"lodash","version":"4.14.1"},{"name":"mousetrap","version":"1.6.0"},{"name":"string_score","version":"joshaven/string_score#0.1.22"},{"name":"ui-router","version":"0.2.18"}]/*END*/;

            let otherComponents = [
                {name: 'highlight.js', version: '9.4.0'},
                {name: 'vkbeautify', version: '0.99.00.beta'}
            ];

            $scope.version = '';
            $scope.libraries = bowerComponents.concat(otherComponents);

            $rester.getInfo().then(info => {
                $scope.version = info.version;
            });

        }
    ]);
