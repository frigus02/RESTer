'use strict';

const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = {
    context: path.join(__dirname, 'src/site'),
    entry: './index.js',
    output: {
        filename: 'scripts/bundle.js',
        path: path.resolve(__dirname, '.build/site')
    },
    resolve: {
        modules: [
            path.resolve(__dirname, 'src/site/bower_components'),
            path.resolve(__dirname, 'node_modules')
        ]
    },
    module: {
        rules: [
            {
                test: /\.html$/,
                use: 'polymer-webpack-loader'
            },
            {
                test: /\.ttf$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        outputPath: 'assets/'
                    }
                }
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'index.ejs',
            inject: false
        }),
        new CopyWebpackPlugin([
            {
                from: 'background/**/*'
            },
            {
                from: 'images/*'
            },
            {
                from: 'bower_components/ace-builds/src-min-noconflict/{ext-searchbox,mode-{html,json,text,xml},theme-{chrome,twilight},worker-{html,json,xml}}.js'
            },
            {
                from: 'bower_components/vkBeautify/vkbeautify.js',
                to: 'bower_components/vkBeautify/vkbeautify.js'
            },
            {
                from: 'bower_components/webcomponentsjs/webcomponents-*.js'
            },
            {
                from: 'elements/data/workers/format-code.js',
                to: 'elements/data/workers/format-code.js'
            },
            {
                from: 'images/*'
            },
            {
                from: 'scripts/*'
            },
            {
                from: 'bower.json'
            }
        ])
    ],
    devtool: 'source-map'
};
