'use strict';

const path = require('path');

const through = require('through2');


function generateUsedLibraryText(usedBowerFiles) {
    const bowerLibraries = usedBowerFiles
        .sort()
        .filter((path, index, self) => self.indexOf(path) === index)
        .filter(path => path.startsWith('src/site/bower_components/'))
        .map(path => path.substr('src/site/bower_components/'.length))
        .reduce((libs, path) => {
            const lib = path.substr(0, path.indexOf('/'));
            const file = path.substr(path.indexOf('/') + 1);
            libs[lib] = libs[lib] || [];
            libs[lib].push(file);
            return libs;
        }, {});

    const text = Object.keys(bowerLibraries)
        .map(lib => {
            const files = bowerLibraries[lib];
            const bowerJson = require(`../../src/site/bower_components/${lib}/.bower.json`);

            return {
                name: lib,
                version: bowerJson._resolution.tag,
                files: files.map(file => `${bowerJson._source.replace(/\.git$/, '')}/blob/${bowerJson._resolution.tag}/${file}`)
            };
        })
        .map(lib => `${lib.name} ${lib.version}\n${lib.files.join('\n')}`)
        .join('\n\n');

    return text;
}


/**
 * Collects all file names and generates links to all used libraries
 * (bower components).
 *
 * @param {string} fileName - Name of the generated file.
 * @param {object} options
 * @param {string[]} options.additionalFiles - More file names to use
 *      in the generated library links.
 * @param {string} options.header - Content at start of generated file.
 * @param {string} options.footer - Content at end of generated file.
 */
module.exports = function (fileName, options) {
    const names = [...options.additionalFiles];
    let latestFile;

    function collectFileNames(file, enc, cb) {
        names.push(file.relative.replace(/\\/g, '/'));
        latestFile = file;
        cb();
    }

    function generateLibraryLinks(cb) {
        const text = generateUsedLibraryText(names);

        const file = latestFile.clone({contents: false});
        file.path = path.join(latestFile.base, fileName);
        file.contents = Buffer.from(options.header + text + options.footer);
        this.push(file);
        cb();
    }

    return through.obj(collectFileNames, generateLibraryLinks);
};
