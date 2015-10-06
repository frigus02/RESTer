'use strict';

const fs = require('fs'),
      rimraf = require('rimraf'),
      mkdirp = require('mkdirp'),
      cheerio = require('cheerio');

removeDataBowerComponents(function () {
    getFileToCopyFromIndexHtml(function (paths) {
        paths.forEach(function (path) {
            copyFileFromBowerComponentsToData(path);
        });
    });
});

function removeDataBowerComponents(callback) {
    console.log('Start removeDataBowerComponents');

    rimraf('data/site/bower_components/', function (err) {
        if (err) throw err;
        console.log('Success removeDataBowerComponents');
        callback();
    });
}

function getFileToCopyFromIndexHtml(callback) {
    console.log('Start getFileToCopyFromIndexHtml');
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

        console.log('Success getFileToCopyFromIndexHtml');

        callback(paths);
    });
}

function copyFileFromBowerComponentsToData(path) {
    let targetPath = 'data/site/' + path;

    console.log('Start copyFileFromBowerComponentsToData: ' + path);

    fs.readFile(path, function (err, data) {
        if (err) throw err;

        mkdirp(targetPath.substr(0, targetPath.lastIndexOf('/')), function (err) {
            if (err) throw err;

            fs.writeFile(targetPath, data, function (err) {
                if (err) throw err;

                console.log('Success copyFileFromBowerComponentsToData: ' + path);
            });
        });
    });
}
