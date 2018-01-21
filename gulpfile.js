'use strict';

const del = require('del');
const gulp = require('gulp');
const zip = require('gulp-zip');

const enhanceManifestJson = require('./tools/tasks/enhance-manifest-json');
const generateLibraryLinks = require('./tools/tasks/generate-library-links');
const importReferencedSources = require('./tools/tasks/import-referenced-sources');
const packageJson = require('./package.json');


const basePaths = {
    src: 'src/',
    build: '.build/',
    package: '.package/'
};
const pathsToCopy = [
    'src/background/**',
    'src/images/**',
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
    'src/site/bower_components/font-roboto/fonts/roboto/Roboto-Black.ttf',
    'src/site/bower_components/font-roboto/fonts/roboto/Roboto-BlackItalic.ttf',
    'src/site/bower_components/font-roboto/fonts/roboto/Roboto-Bold.ttf',
    'src/site/bower_components/font-roboto/fonts/roboto/Roboto-BoldItalic.ttf',
    'src/site/bower_components/font-roboto/fonts/roboto/Roboto-Italic.ttf',
    'src/site/bower_components/font-roboto/fonts/roboto/Roboto-Light.ttf',
    'src/site/bower_components/font-roboto/fonts/roboto/Roboto-LightItalic.ttf',
    'src/site/bower_components/font-roboto/fonts/roboto/Roboto-Medium.ttf',
    'src/site/bower_components/font-roboto/fonts/roboto/Roboto-MediumItalic.ttf',
    'src/site/bower_components/font-roboto/fonts/roboto/Roboto-Regular.ttf',
    'src/site/bower_components/font-roboto/fonts/roboto/Roboto-Thin.ttf',
    'src/site/bower_components/font-roboto/fonts/roboto/Roboto-ThinItalic.ttf',
    'src/site/bower_components/font-roboto/fonts/robotomono/RobotoMono-Bold.ttf',
    'src/site/bower_components/font-roboto/fonts/robotomono/RobotoMono-BoldItalic.ttf',
    'src/site/bower_components/font-roboto/fonts/robotomono/RobotoMono-Italic.ttf',
    'src/site/bower_components/font-roboto/fonts/robotomono/RobotoMono-Light.ttf',
    'src/site/bower_components/font-roboto/fonts/robotomono/RobotoMono-LightItalic.ttf',
    'src/site/bower_components/font-roboto/fonts/robotomono/RobotoMono-Medium.ttf',
    'src/site/bower_components/font-roboto/fonts/robotomono/RobotoMono-MediumItalic.ttf',
    'src/site/bower_components/font-roboto/fonts/robotomono/RobotoMono-Regular.ttf',
    'src/site/bower_components/font-roboto/fonts/robotomono/RobotoMono-Thin.ttf',
    'src/site/bower_components/font-roboto/fonts/robotomono/RobotoMono-ThinItalic.ttf',
    'src/site/bower_components/vkBeautify/vkbeautify.js',
    'src/site/bower_components/webcomponentsjs/webcomponents-ce.js',
    'src/site/bower_components/webcomponentsjs/webcomponents-lite.js',
    'src/site/bower_components/webcomponentsjs/webcomponents-loader.js',
    'src/site/bower_components/webcomponentsjs/webcomponents-sd-ce.js',
    'src/site/bower_components/webcomponentsjs/webcomponents-sd.js',
    'src/site/elements/data/workers/format-code.js',
    'src/site/images/**',
    'src/site/scripts/**',
    'src/site/bower.json',
    'src/site/index.html',
    'src/manifest.json'
];
const additionalManifestEntries = {
    firefox: {
        applications: {
            gecko: {
                id: 'rester@kuehle.me',
                strict_min_version: '55.0'
            }
        },
        icons: {
            48: 'images/icon48.png',
            96: 'images/icon96.png'
        },
        browser_action: {
            default_icon: {
                16: 'images/icon16.png',
                24: 'images/icon24.png',
                32: 'images/icon32.png'
            },
            theme_icons: [
                {
                    dark: 'images/icon16.png',
                    light: 'images/icon-light16.png',
                    size: 16
                },
                {
                    dark: 'images/icon24.png',
                    light: 'images/icon-light24.png',
                    size: 24
                },
                {
                    dark: 'images/icon32.png',
                    light: 'images/icon-light32.png',
                    size: 32
                }
            ]
        }
    },
    chrome: {
        minimum_chrome_version: '60',
        icons: {
            48: 'images/icon48.png',
            128: 'images/icon128.png'
        },
        browser_action: {
            default_icon: {
                16: 'images/icon16.png',
                24: 'images/icon24.png',
                32: 'images/icon32.png'
            }
        }
    }
};


// Package

async function cleanPackage() {
    await del(basePaths.package);
}

function packageChrome() {
    const paths = [
        // All build files
        basePaths.build + '**',

        // But only the used images
        '!' + basePaths.build + 'images/**',
        basePaths.build + 'images/icon{16,24,32,48,128}.png'
    ];

    return gulp.src(paths, {base: basePaths.build})
        .pipe(enhanceManifestJson(additionalManifestEntries.chrome, packageJson.version))
        .pipe(zip(`chrome-${packageJson.version}.zip`))
        .pipe(gulp.dest(basePaths.package));
}

function packageFirefox() {
    const paths = [
        // All build files
        basePaths.build + '**',

        // But only the used images
        '!' + basePaths.build + 'images/**',
        basePaths.build + 'images/icon{16,24,32,48,96}.png',
        basePaths.build + 'images/icon-light{16,24,32,48,96}.png'
    ];

    return gulp.src(paths, {base: basePaths.build})
        .pipe(enhanceManifestJson(additionalManifestEntries.firefox, packageJson.version))
        .pipe(zip(`firefox-${packageJson.version}.zip`))
        .pipe(gulp.dest(basePaths.package));
}


// Utils

function updateLibraryLinks() {
    return gulp.src(basePaths.src + 'site/elements/rester-app.html', {base: '.'})
        .pipe(importReferencedSources())
        .pipe(generateLibraryLinks('library-links.md', {
            additionalFiles: pathsToCopy,
            header: [
                '# Libary links',
                'As stated in the post [Improving Review Time by Providing Links to Third Party Sources](https://blog.mozilla.org/addons/2016/04/05/improved-review-time-with-links-to-sources/) it is useful for the addon reviewers to have links to the sources of third party libraries, which are used in the addon.',
                'Update this file with all changes to used third party libraries (add/remove dependency, change version). Use the helper, which is automatically executed after dependency installation:',
                '    yarn install',
                '```\n'
            ].join('\n\n'),
            footer: '\n```\n'
        }))
        .pipe(gulp.dest('docs/'));
}


const buildPackage = gulp.series(build, cleanPackage, packageChrome, packageFirefox);

gulp.task('package', buildPackage);
gulp.task('updatelibrarylinks', updateLibraryLinks);
