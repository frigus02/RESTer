'use strict';

const fs = require('fs');
const { promisify } = require('util');

const writeFile = promisify(fs.writeFile);


function generateUsedLibraryText(usedFiles) {
    const bowerLibraries = usedFiles
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
            const version = bowerJson._resolution.type === 'version'
                ? bowerJson._resolution.tag
                : bowerJson._resolution.commit;

            return {
                name: lib,
                version: version,
                files: files.map(file => `${bowerJson._source.replace(/\.git$/, '')}/blob/${version}/${file}`)
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
 * @param {object} options
 * @param {string} options.filename - Name of the generated file.
 * @param {string[]} options.additionalFiles - More file names to use
 *      in the generated library links.
 * @param {string} options.header - Content at start of generated file.
 * @param {string} options.footer - Content at end of generated file.
 */
class GenerateLibraryLinksPlugin {
    constructor(options) {
        this.options = options;
    }

    apply(compiler) {
        const options = this.options;
        compiler.hooks.emit.tapPromise('GenerateLibraryLinksPlugin', async compilation => {
            const usedFiles = [
                ...options.additionalFiles,
                ...Array.from(compilation.fileDependencies)
                    .map(filename => filename.replace(/\\/g, '/'))
                    .map(filename => filename.substr(filename.indexOf('/src/') + 1))
            ];

            const text = generateUsedLibraryText(usedFiles);
            const fileContent = options.header + text + options.footer;

            await writeFile(options.filename, fileContent, 'utf8');
        });
    }
}

module.exports = GenerateLibraryLinksPlugin;
