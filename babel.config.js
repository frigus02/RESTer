'use strict';

const presets = [];
const plugins = [];

if (process.env.NODE_ENV === 'test') {
    presets.push(['@babel/preset-env', { targets: { node: 'current' } }]);
}

module.exports = { presets, plugins };
