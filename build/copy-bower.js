'use strict';

const fs = require('fs'),
      rimraf = require('rimraf'),
      mkdirp = require('mkdirp'),
      cheerio = require('cheerio');

removeDataBowerComponents(function () {
    getFilesToCopyFromIndexHtml(function (paths) {
        paths.forEach(function (path) {
            copyFileFromBowerComponentsToData(path);
        });
    });
});

function removeDataBowerComponents(callback) {
    console.log('Remove existing bower_components folder from data/site...');

    rimraf('data/site/bower_components/', function (err) {
        if (err) throw err;
        callback();
    });
}

function getFilesToCopyFromIndexHtml(callback) {
    console.log('Reading data/site/index.html to find files to copy...');

    fs.readFile('data/site/index.html', function (err, data) {
        if (err) throw err;

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

        callback(paths);
    });
}

function copyFileFromBowerComponentsToData(path) {
    console.log('Copy file to data/site: ' + path);

    let targetFilePath = 'data/site/' + path,
        targetDirectoryPath = targetFilePath.substr(0, targetFilePath.lastIndexOf('/'));

    fs.readFile(path, function (err, data) {
        if (err) throw err;
        mkdirp(targetDirectoryPath, function (err) {
            if (err) throw err;
            fs.writeFile(targetFilePath, data, function (err) {
                if (err) throw err;
            });
        });
    });
}
