'use strict';

const promiseDenodeify = require('./promise-denodeify'),
      fs = require('fs'),
      readFile = promiseDenodeify(fs.readFile),
      writeFile = promiseDenodeify(fs.writeFile),
      rimraf = promiseDenodeify(require('rimraf')),
      mkdirp = promiseDenodeify(require('mkdirp')),
      cheerio = require('cheerio');

let ADDITIONAL_SCRIPTS = [];

function removeDataBowerComponents() {
    console.log('Remove existing bower_components folder from data/site...');

    return rimraf('data/site/bower_components/');
}

function getFilesToCopyFromIndexHtml() {
    console.log('Reading data/site/index.html to find files to copy...');

    return readFile('data/site/index.html').then(function (data) {
        let $ = cheerio.load(data),
            paths = [];

        $('script[src^="bower_components/"]').each(function () {
            console.log('    Found ' + $(this).attr('src'));
            paths.push($(this).attr('src'));
        });

        $('link[href^="bower_components/"]').each(function () {
            console.log('    Found ' + $(this).attr('href'));
            paths.push($(this).attr('href'));
        });

        return paths;
    });
}

function copyFileFromBowerComponentsToData(path) {
    console.log('Copy file to data/site: ' + path);

    let targetFilePath = 'data/site/' + path,
        targetDirectoryPath = targetFilePath.substr(0, targetFilePath.lastIndexOf('/'));

    return mkdirp(targetDirectoryPath)
        .then(function () {
            return readFile(path);
        })
        .then(function (data) {
            return writeFile(targetFilePath, data);
        });
}


module.exports = function () {
    return removeDataBowerComponents()
        .then(function () {
            return getFilesToCopyFromIndexHtml();
        })
        .then(function (paths) {
            paths.push.apply(paths, ADDITIONAL_SCRIPTS);

            let promises = paths.map(function (path) {
                return copyFileFromBowerComponentsToData(path);
            });

            return Promise.all(promises);
        });
};
