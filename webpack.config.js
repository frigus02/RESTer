'use strict';

const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

const GenerateLibraryLinksPlugin = require('./tools/plugins/generate-library-links');

module.exports = [
    {
        name: 'background',
        context: path.join(__dirname, 'src/background'),
        entry: './index.js',
        output: {
            filename: 'bundle.js',
            path: path.resolve(__dirname, '.build/background')
        }
    },
    {
        name: 'site',
        context: path.join(__dirname, 'src/site'),
        entry: './index.js',
        output: {
            filename: 'scripts/bundle.js',
            path: path.resolve(__dirname, '.build/site')
        },
        resolve: {
            alias: {
                '@polymer/font-roboto/roboto.js': '@polymer/font-roboto-local/roboto.js'
            }
        },
        module: {
            rules: [
                {
                    test: /@polymer[/\\]font-roboto-local[/\\]roboto\.js$/,
                    loader: 'string-replace-loader',
                    options: {
                        search: 'import.meta.url',
                        replace: 'location.href'
                    }
                },
                {
                    test: /\.ttf$/,
                    loader: 'file-loader',
                    options: {
                        outputPath: 'assets/'
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
                    from: 'node_modules/ace-builds/src-min-noconflict/{ext-searchbox,mode-{html,json,text,xml},theme-{chrome,twilight},worker-{html,json,xml}}.js',
                    context: '../../'
                },
                {
                    from: 'node_modules/frigus02-vkbeautify/*.js',
                    context: '../../'
                },
                {
                    from: 'fonts/**/*.ttf',
                    context: '../../node_modules/@polymer/font-roboto-local/'
                },
                {
                    from: 'node_modules/@webcomponents/webcomponentsjs/webcomponents-*.js',
                    context: '../../'
                },
                {
                    from: 'node_modules/@webcomponents/webcomponentsjs/bundles/*.js',
                    context: '../../'
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
                }
            ]),
            new GenerateLibraryLinksPlugin({
                filename: path.resolve(__dirname, 'docs/library-links.md'),
                additionalFiles: [
                    'node_modules/ace-builds/src-min-noconflict/ext-searchbox.js',
                    'node_modules/ace-builds/src-min-noconflict/mode-html.js',
                    'node_modules/ace-builds/src-min-noconflict/mode-json.js',
                    'node_modules/ace-builds/src-min-noconflict/mode-text.js',
                    'node_modules/ace-builds/src-min-noconflict/mode-xml.js',
                    'node_modules/ace-builds/src-min-noconflict/theme-chrome.js',
                    'node_modules/ace-builds/src-min-noconflict/theme-twilight.js',
                    'node_modules/ace-builds/src-min-noconflict/worker-html.js',
                    'node_modules/ace-builds/src-min-noconflict/worker-json.js',
                    'node_modules/ace-builds/src-min-noconflict/worker-xml.js',
                    'node_modules/frigus02-vkbeautify/vkbeautify.js',
                    'node_modules/@webcomponents/webcomponentsjs/webcomponents-bundle.js',
                    'node_modules/@webcomponents/webcomponentsjs/webcomponents-loader.js',
                    'node_modules/@webcomponents/webcomponentsjs/bundles/webcomponents-ce.js',
                    'node_modules/@webcomponents/webcomponentsjs/bundles/webcomponents-sd-ce-pf.js',
                    'node_modules/@webcomponents/webcomponentsjs/bundles/webcomponents-sd-ce.js',
                    'node_modules/@webcomponents/webcomponentsjs/bundles/webcomponents-sd.js'
                ],
                header: [
                    '# Libary links',
                    'As stated in the post [Improving Review Time by Providing Links to Third Party Sources](https://blog.mozilla.org/addons/2016/04/05/improved-review-time-with-links-to-sources/) it is useful for the addon reviewers to have links to the sources of third party libraries, which are used in the addon.',
                    'Update this file with all changes to used third party libraries (add/remove dependency, change version). Use the helper, which is automatically executed on every build:',
                    '    yarn build',
                    '```\n'
                ].join('\n\n'),
                footer: '\n```\n'
            })
        ]
    }
];
