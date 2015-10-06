'use strict';

angular.module('app')
    .service('$authorization', ['$q', function ($q) {
        let self = this;

        /**
         * @typedef $authTokenProvider~AuthorizationProvider
         * @type {Object}
         * @property {Number} id - Unique id of the provider.
         * @property {String} title - Display name of the provider.
         * @property {Boolean} needsConfiguration - Indicates, whether
         * the provider needs a configuration object in order to generate
         * a new token.
         */
        self.AuthorizationProvider = function (id, title, needsConfiguration) {
            this.id = id;
            this.title = title;
            this.needsConfiguration = !!needsConfiguration;
        };

        self.AuthorizationProvider.prototype = {
            /**
             * Generates a new authorization token using the specified
             * configuration.
             * @param {$data~AuthorizationProviderConfiguration} config
             * @returns {Promise.<$data~AuthorizationToken>} A promise, which
             * returns the authorization when it is resolved.
             */
            generateToken: function (config) {
                return $q.reject();
            },

            /**
             * Creates a new configuration. Will probably show a dialog to the user
             * asking for data.
             * @returns {Promise.<$data~AuthorizationProviderConfiguration>}
             */
            createConfiguration: function () {
                return $q.reject();
            },

            /**
             * Edits the specified configuration. Will probably show a dialog to
             * the user asking for updated information. When the result promise
             * resolves to the string 'delete', this means the configuration should
             * be deleted.
             * @param {$data~AuthorizationProviderConfiguration} config
             * @returns {Promise.<$data~AuthorizationProviderConfiguration>}
             */
            editConfiguration: function (config) {
                return $q.reject();
            }
        };

        self.$$providers = [];

        self.getProviders = function () {
            return self.$$providers;
        };

    }]);
