'use strict';

const { target } = require('lib/data/utils/events');

exports.on = target.on.bind(target);
exports.once = target.once.bind(target);
exports.off = target.off.bind(target);

exports.authorizationProviderConfigurations = require('lib/data/authorization-provider-configurations');
exports.authorizationTokens = require('lib/data/authorization-tokens');
exports.environments = require('lib/data/environments');
exports.history = require('lib/data/history');
exports.requests = require('lib/data/requests');
exports.responses = require('lib/data/responses');
