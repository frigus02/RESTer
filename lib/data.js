'use strict';

const { target } = require('lib/data/utils/events');

target.authorizationProviderConfigurations = require('lib/data/authorization-provider-configurations');
target.authorizationTokens = require('lib/data/authorization-tokens');
target.environments = require('lib/data/environments');
target.history = require('lib/data/history');
target.requests = require('lib/data/requests');
target.responses = require('lib/data/responses');

target.import = require('lib/data/utils/import');

module.exports = target;
