'use strict';

angular.module('app')
    .factory('$settings', ['$window', function ($window) {

        function prefixKey(key) {
            return 'rester.' + key;
        }

        function fireListeners(listeners, ...args) {
            listeners.forEach(l => {
                l(...args);
            });
        }

        class Settings {
            constructor () {
                this.changeListeners = [];
            }

            addChangeListener (listener) {
                this.changeListeners.push(listener);
            }

            _get (key, isJson, defaultValue) {
                let value = $window.localStorage.getItem(prefixKey(key));
                if (value === null && typeof defaultValue !== undefined) {
                    return defaultValue;
                }

                return isJson && value ? JSON.parse(value) : value;
            }

            _set (key, value, isJson) {
                let preparedValue = isJson ? JSON.stringify(value) : value;
                $window.localStorage.setItem(prefixKey(key), preparedValue);
            }

            get activeEnvironment () {
                return this._get('active_environment', true);
            }

            set activeEnvironment (value) {
                this._set('active_environment', value, true);
                fireListeners(this.changeListeners);
            }

            get stripDefaultHeaders () {
                return !!this._get('strip_default_headers', true);
            }

            set stripDefaultHeaders (value) {
                this._set('strip_default_headers', !!value, true);
                fireListeners(this.changeListeners);
            }

            get enableRequestLintInspections () {
                return !!this._get('enable_request_lint_inspections', true, true);
            }

            set enableRequestLintInspections (value) {
                this._set('enable_request_lint_inspections', !!value, true);
                fireListeners(this.changeListeners);
            }

            get pinSidenav () {
                return !!this._get('pin_sidenav', true);
            }

            set pinSidenav (value) {
                this._set('pin_sidenav', !!value, true);
                fireListeners(this.changeListeners);
            }

            get experimentalResponseHighlighting () {
                return !!this._get('experimental_response_highlighting', true);
            }

            set experimentalResponseHighlighting (value) {
                this._set('experimental_response_highlighting', !!value, true);
                fireListeners(this.changeListeners);
            }
        }

        return new Settings();

    }]);
