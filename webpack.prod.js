'use strict';

const merge = require('webpack-merge');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const webpack = require('webpack');

const common = require('./webpack.common.js');

module.exports = common.map(config => merge(config, {
    plugins: [
        new UglifyJsPlugin({
            uglifyOptions: {
                mangle: {
                    keep_classnames: true,
                    reserved: ['resterApi']
                }
            }
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        })
    ]
}));
