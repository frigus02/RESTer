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

            get (key, isJson) {
                let value = $window.localStorage.getItem(prefixKey(key));
                return isJson && value ? JSON.parse(value) : value;
            }

            set (key, value, isJson) {
                let preparedValue = isJson ? JSON.stringify(value) : value;
                $window.localStorage.setItem(prefixKey(key), preparedValue);
            }

            get activeEnvironment () {
                return this.get('active_environment', true);
            }

            set activeEnvironment (value) {
                this.set('active_environment', value, true);
                fireListeners(this.changeListeners);
            }
        }

        return new Settings();

    }]);
