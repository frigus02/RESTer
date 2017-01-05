const gulp = require('gulp');
const gutil = require('gulp-util');
const crisper = require('gulp-crisper');
const filter = require('gulp-filter');
const polylint = require('gulp-polylint');
const vulcanize = require('gulp-vulcanize');
const del = require('del');
const importReferencedSources = require('./tools/tasks/import-referenced-sources');


const basePaths = {
    src: 'src/',
    build: '.build/'
};
const pathsToCopy = [
    'src/background/**',
    'src/images/**',
    'src/site/bower_components/ace-builds/src-min-noconflict/theme-twilight.js',
    'src/site/bower_components/ace-builds/src-min-noconflict/mode-json.js',
    'src/site/bower_components/ace-builds/src-min-noconflict/worker-json.js',
    'src/site/bower_components/ace-builds/src-min-noconflict/mode-xml.js',
    'src/site/bower_components/ace-builds/src-min-noconflict/worker-xml.js',
    'src/site/bower_components/ace-builds/src-min-noconflict/mode-html.js',
    'src/site/bower_components/ace-builds/src-min-noconflict/worker-html.js',
    'src/site/bower_components/ace-builds/src-min-noconflict/mode-text.js',
    'src/site/bower_components/ace-builds/src-min-noconflict/ext-searchbox.js',
    'src/site/bower_components/webcomponentsjs/webcomponents-lite.min.js',
    'src/site/elements/data/workers/format-code.js',
    'src/site/images/**',
    'src/site/other_components/vkbeautify/vkbeautify.js',
    'src/site/scripts/**',
    'src/site/bower.json',
    'src/site/index.html',
    'src/manifest.json'
];

function logFileChangeEvent(path) {
    gutil.log('Detected file change:', path);
}

function clean() {
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

function lint() {
    return gulp.src(basePaths.src + 'site/elements/rester-app.html')
        .pipe(polylint())
        .pipe(polylint.reporter(polylint.reporter.stylishlike))
        .pipe(polylint.reporter.fail({buffer: true, ignoreWarnings: false}));
}

function watch() {
    gulp.watch(pathsToCopy, copy).on('change', logFileChangeEvent);
    gulp.watch('src/site/elements/**/*.{html,js}').on('change', path => {
        logFileChangeEvent(path);
        crispElementIntoMultipleFiles(path);
    });
}


const serve = gulp.series(clean, crispAppIntoMultipleFiles, copy, watch);
const build = gulp.series(clean, lint, crispAppIntoSingleFile, copy);

gulp.task('serve', serve);
gulp.task('build', build);
gulp.task('default', serve);
