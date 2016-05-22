'use strict';

angular.module('app')
    .controller('AboutCtrl', ['$scope', '$state', '$rester',
        function ($scope, $state, $rester) {

            $state.current.data = {
                title: 'About'
            };

            let bowerComponents = /*START*/[{"name":"angular","version":"1.5.5"},{"name":"angular-animate","version":"1.5.5"},{"name":"angular-aria","version":"1.5.5"},{"name":"angular-jwt","version":"0.0.9"},{"name":"angular-material","version":"1.0.8"},{"name":"angular-messages","version":"1.5.5"},{"name":"angular-sanitize","version":"1.5.5"},{"name":"angular-ui-codemirror","version":"0.3.0"},{"name":"codemirror","version":"5.15.2"},{"name":"lodash","version":"4.12.0"},{"name":"mousetrap","version":"1.5.3"},{"name":"string_score","version":"joshaven/string_score#^0.1.22"},{"name":"ui-router","version":"0.2.18"}]/*END*/;

            let otherComponents = [
                {name: 'highlight.js', version: '9.4.0'}
            ];

            $scope.version = '';
            $scope.libraries = bowerComponents.concat(otherComponents);

            $rester.getInfo().then(info => {
                $scope.version = info.version;
            });

        }
    ]);
