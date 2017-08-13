'use strict';

const crisper = require('gulp-crisper');
const del = require('del');
const eslint = require('gulp-eslint');
const filter = require('gulp-filter');
const gulp = require('gulp');
const gutil = require('gulp-util');
const mergeStream = require('merge-stream');
const polymerAnalyzer = require('polymer-analyzer');
const polymerLinter = require('polymer-linter');
const rename = require('gulp-rename');
const vulcanize = require('gulp-vulcanize');
const zip = require('gulp-zip');
const lead = require('lead');

const createFirefoxAddon = require('./tools/tasks/create-firefox-addon');
const collectFileNames = require('./tools/tasks/collect-file-names');
const enhanceManifestJson = require('./tools/tasks/enhance-manifest-json');
const importReferencedSources = require('./tools/tasks/import-referenced-sources');
const lintFirefoxAddon = require('./tools/tasks/lint-firefox-addon');
const updateLibraryLinksInFile = require('./tools/tasks/update-library-links');
const wctPrepare = require('./tools/tasks/wct-prepare');
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
    'src/site/bower_components/vkbeautify/vkbeautify.js',
    'src/site/bower_components/webcomponentsjs/webcomponents-hi-ce.js',
    'src/site/bower_components/webcomponentsjs/webcomponents-hi-sd-ce.js',
    'src/site/bower_components/webcomponentsjs/webcomponents-hi.js',
    'src/site/bower_components/webcomponentsjs/webcomponents-lite.js',
    'src/site/bower_components/webcomponentsjs/webcomponents-loader.js',
    'src/site/bower_components/webcomponentsjs/webcomponents-sd-ce.js',
    'src/site/elements/data/workers/format-code.js',
    'src/site/images/**',
    'src/site/scripts/**',
    'src/site/bower.json',
    'src/site/index.html',
    'src/manifest.json'
];
const additionalManifestEntries = {
    firefox: {
        // As long as the WebExtension is shipped embedded in an Add-on SDK extension,
        // the applications key is not needed.
        /*applications: {
            gecko: {
                id: 'rester@kuehle.me',
                strict_min_version: '55.0.0'
            }
        },*/
        icons: {
            48: 'images/icon48.png',
            96: 'images/icon96.png'
        },
        browser_action: {
            default_icon: 'images/icon.svg'
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


// Build

function cleanBuild() {
    return del(basePaths.build);
}

function copy() {
    return gulp.src(pathsToCopy, {base: basePaths.src})
        .pipe(gulp.dest(basePaths.build));
}

function crispElementIntoMultipleFiles(filePath) {
    const htmlFilter = filter('**/*.html', {restore: true});

    return gulp.src(filePath, {base: basePaths.src})
        .pipe(importReferencedSources())
        .pipe(htmlFilter)
        .pipe(crisper({
            scriptInHead: false
        }))
        .pipe(htmlFilter.restore)
        .pipe(gulp.dest(basePaths.build));
}

function crispAppIntoMultipleFiles() {
    return crispElementIntoMultipleFiles(basePaths.src + 'site/elements/rester-app.html');
}

function crispAppIntoSingleFile() {
    return gulp.src(basePaths.src + 'site/elements/rester-app.html', {base: basePaths.src})
        .pipe(vulcanize({
            inlineScripts: true,
            stripComments: true
        }))
        .pipe(crisper())
        .pipe(gulp.dest(basePaths.build));
}

function watch() {
    function logFileChangeEvent(path) {
        gutil.log('Detected file change:', path);
    }

    gulp.watch(pathsToCopy, copy).on('change', logFileChangeEvent);
    gulp.watch('src/site/elements/**/*.{html,js}').on('change', path => {
        logFileChangeEvent(path);
        crispElementIntoMultipleFiles(path);
    });
}


// Lint

function lintJavaScript() {
    return gulp.src(basePaths.src + '**/*.{js,html}')
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
}

async function lintWebComponents() {
    const rules = polymerLinter.registry.getRules(['polymer-2']);
    const analyzer = new polymerAnalyzer.Analyzer({
        urlLoader: new polymerAnalyzer.FSUrlLoader(basePaths.src + 'site/')
    });

    const linter = new polymerLinter.Linter(rules, analyzer);
    const warnings = await linter.lintPackage();

    const printer = new polymerAnalyzer.WarningPrinter(process.stdout, { verbosity: 'full', color: true });
    await printer.printWarnings(warnings);
}

async function lintAddon() {
    await lintFirefoxAddon({
        addonDir: basePaths.build
    });
}


// Package

function cleanPackage() {
    return del(basePaths.package);
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
    const webExtensionPaths = [
        // All build files
        basePaths.build + '**',

        // But only the used images
        '!' + basePaths.build + 'images/**',
        basePaths.build + 'images/icon{48,96}.png',
        basePaths.build + 'images/icon.svg'
    ];

    const webExtension = gulp.src(webExtensionPaths, {base: basePaths.build})
        .pipe(enhanceManifestJson(additionalManifestEntries.firefox, packageJson.version))
        .pipe(rename(path => {
            path.dirname = 'webextension/' + path.dirname;
        }));

    const addonPath = 'tools/firefox-addon/';

    const addon = gulp.src(addonPath + '**', {base: addonPath});

    return new Promise((resolve, reject) => {
        const addonOptions = {
            addonDir: basePaths.package + `firefox-${packageJson.version}`,
            destFile: basePaths.package + `firefox-${packageJson.version}.xpi`,
            validateVersion: packageJson.version
        };

        const stream = mergeStream(addon, webExtension)
            .pipe(gulp.dest(addonOptions.addonDir));

        stream.on('finish', () => {
            createFirefoxAddon(addonOptions).then(resolve, reject);
        });

        stream.on('error', reject);
    });
}


// Utils

function updateLibraryLinks() {
    return new Promise((resolve, reject) => {
        const fileNames = collectFileNames();
        const stream = gulp.src(basePaths.src + 'site/elements/rester-app.html', {base: '.'})
            .pipe(importReferencedSources())
            .pipe(fileNames)
            .on('finish', () => {
                resolve(fileNames.get());
            })
            .on('error', reject);

        lead(stream);
    }).then(extractedFileNames => {
        return updateLibraryLinksInFile(extractedFileNames.concat(...pathsToCopy));
    });
}


const build = gulp.series(cleanBuild, crispAppIntoSingleFile, copy);
const buildDev = gulp.series(cleanBuild, crispAppIntoMultipleFiles, copy);

const dev = gulp.series(buildDev, watch);
const lint = gulp.series(buildDev, lintJavaScript, lintWebComponents, lintAddon);
const buildPackage = gulp.series(build, cleanPackage, packageChrome, packageFirefox);

gulp.task('default', dev);
gulp.task('dev', dev);
gulp.task('build', build);
gulp.task('lint', lint);
gulp.task('package', buildPackage);
gulp.task('util:preparewct', wctPrepare);
gulp.task('util:updatelibrarylinks', updateLibraryLinks);
