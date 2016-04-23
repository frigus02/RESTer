'use strict';

angular.module('app')
    .controller('AboutCtrl', ['$scope', '$state', '$rester',
        function ($scope, $state, $rester) {

            $state.current.data = {
                title: 'About'
            };

            let bowerComponents = /*START*/[{"name":"angular","version":"1.5.5"},{"name":"angular-animate","version":"1.5.5"},{"name":"angular-aria","version":"1.5.5"},{"name":"angular-jwt","version":"0.0.9"},{"name":"angular-material","version":"1.0.5"},{"name":"angular-messages","version":"1.5.5"},{"name":"angular-sanitize","version":"1.5.5"},{"name":"angular-ui-codemirror","version":"0.3.0"},{"name":"codemirror","version":"5.13.2"},{"name":"lodash","version":"4.11.2"},{"name":"mousetrap","version":"1.5.3"},{"name":"ui-router","version":"0.2.18"},{"name":"string_score","version":"joshaven/string_score#^0.1.22"}]/*END*/;

            let otherComponents = [
                {name: 'highlight.js', version: '9.2.0'}
            ];

            $scope.version = '';
            $scope.libraries = bowerComponents.concat(otherComponents);

            $rester.getInfo().then(info => {
                $scope.version = info.version;
            });

        }
    ]);
