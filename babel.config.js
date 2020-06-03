'use strict';

module.exports = (api) => {
    if (api.env('test')) {
        return {
            presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
        };
    }
};
