/* jshint node: true */

'use strict';

module.exports = function (config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',

        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine'],

        // list of files / patterns to load in the browser
        files: [
            'data/site/bower_components/angular/angular.min.js',
            'data/site/bower_components/**/*.js',
            'bower_components/angular-mocks/angular-mocks.js',

            'data/site/scripts/**/*.js',

            'test-karma/data/site/**/*.js'
        ],

        // list of files to exclude
        exclude: [
            'data/site/scripts/workers/**/*.js'
        ],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'data/site/scripts/**/*.js': ['coverage']
        },

        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress', 'coverage'],

        coverageReporter: {
            reporters: [
                {type: 'html', dir: 'test-karma-coverage/'},
                {type: 'text-summary'}
            ]
        },

        // web server port
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,

        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['FirefoxDeveloper'],

        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false,

        // how many browser should be started simultaneous
        concurrency: Infinity
    });
};
