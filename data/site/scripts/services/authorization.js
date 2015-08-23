'use strict';

angular.module('app')
    .service('$authorization', ['$q', function ($q) {
        var self = this;

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
             * @property {$data~AuthorizationProviderConfiguration} config
             * @returns {Promise.<$data~AuthorizationToken>} A promise, which
             * returns the authorization when it is resolved.
             */
            generateToken: function (config) { return $q.reject(); },

            /**
             * Creates a new configuration. Will probably show a dialog to the user
             * asking for data.
             * @returns {Promise.<$data~AuthorizationProviderConfiguration>}
             */
            createConfiguration: function () { return $q.reject(); },

            /**
             * Edits the specified configuration. Will probably show a dialog to
             * the user asking for updated information.
             * @property {$data~AuthorizationProviderConfiguration} config
             * @returns {Promise.<$data~AuthorizationProviderConfiguration>}
             */
            editConfiguration: function (config) { return $q.reject(); }
        };

        self.$$providers = [];

        self.getProviders = function () {
            return self.$$providers;
        };

    }]);
