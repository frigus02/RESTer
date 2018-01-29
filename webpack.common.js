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
            ]),
            new GenerateLibraryLinksPlugin({
                filename: path.resolve(__dirname, 'docs/library-links.md'),
                additionalFiles: [
                    'src/site/bower_components/ace-builds/src-min-noconflict/ext-searchbox.js',
                    'src/site/bower_components/ace-builds/src-min-noconflict/mode-html.js',
                    'src/site/bower_components/ace-builds/src-min-noconflict/mode-json.js',
                    'src/site/bower_components/ace-builds/src-min-noconflict/mode-text.js',
                    'src/site/bower_components/ace-builds/src-min-noconflict/mode-xml.js',
                    'src/site/bower_components/ace-builds/src-min-noconflict/theme-chrome.js',
                    'src/site/bower_components/ace-builds/src-min-noconflict/theme-twilight.js',
                    'src/site/bower_components/ace-builds/src-min-noconflict/worker-html.js',
                    'src/site/bower_components/ace-builds/src-min-noconflict/worker-json.js',
                    'src/site/bower_components/ace-builds/src-min-noconflict/worker-xml.js',
                    'src/site/bower_components/vkBeautify/vkbeautify.js',
                    'src/site/bower_components/webcomponentsjs/webcomponents-ce.js',
                    'src/site/bower_components/webcomponentsjs/webcomponents-lite.js',
                    'src/site/bower_components/webcomponentsjs/webcomponents-loader.js',
                    'src/site/bower_components/webcomponentsjs/webcomponents-sd-ce.js',
                    'src/site/bower_components/webcomponentsjs/webcomponents-sd.js'
                ],
                header: [
                    '# Libary links',
                    'As stated in the post [Improving Review Time by Providing Links to Third Party Sources](https://blog.mozilla.org/addons/2016/04/05/improved-review-time-with-links-to-sources/) it is useful for the addon reviewers to have links to the sources of third party libraries, which are used in the addon.',
                    'Update this file with all changes to used third party libraries (add/remove dependency, change version). Use the helper, which is automatically executed after dependency installation:',
                    '    yarn install',
                    '```\n'
                ].join('\n\n'),
                footer: '\n```\n'
            })
        ]
    }
];
