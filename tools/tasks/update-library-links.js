'use strict';

const fs = require('fs');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);


/**
 * Updates used libraries in the docs/library-links.md file.
 *
 * @param {string[]} usedBowerFiles - Array of files from the
 *     bower_components folder, which are used in the project.
 *     Paths should be relative to the project root.
 * @return {Promise}
 */
function updateLibraryLinks(usedBowerFiles) {
    const text = generateUsedLibraryText(usedBowerFiles);

    return updateTextInFile(text);
}

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

function updateTextInFile(text) {
    const filePath = 'docs/library-links.md';
    return readFile(filePath, 'utf-8').then(content => {
        const newContent = content.replace(/```[\S\s]*```/, '```\n' + text + '\n```');

        return writeFile(filePath, newContent);
    });
}

module.exports = updateLibraryLinks;
