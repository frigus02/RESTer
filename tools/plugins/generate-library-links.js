'use strict';

const fs = require('fs');
const { promisify } = require('util');

const writeFile = promisify(fs.writeFile);


function generateUsedLibraryText(usedFiles) {
    const libraries = usedFiles
        .sort()
        .filter((path, index, self) => self.indexOf(path) === index)
        .filter(path => path.startsWith('node_modules/'))
        .map(path => path.substr('node_modules/'.length))
        .reduce((libs, path) => {
            const lib = path.startsWith('@')
                ? path.substr(0, path.indexOf('/', path.indexOf('/') + 1))
                : path.substr(0, path.indexOf('/'));
            const file = path.substr(lib.length + 1);
            libs[lib] = libs[lib] || [];
            libs[lib].push(file);
            return libs;
        }, {});

    const text = Object.keys(libraries)
        .sort()
        .map(lib => {
            const files = libraries[lib];
            const packageJson = require(`../../node_modules/${lib}/package.json`);

            return {
                name: lib,
                version: packageJson.version,
                files: files.map(file => `https://unpkg.com/${packageJson.name}@${packageJson.version}/${file}`)
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
                    .map(filename => filename.substr(process.cwd().length + 1))
                    .map(filename => filename.replace(/\\/g, '/'))
            ];

            const text = generateUsedLibraryText(usedFiles);
            const fileContent = options.header + text + options.footer;

            await writeFile(options.filename, fileContent, 'utf8');
        });
    }
}

module.exports = GenerateLibraryLinksPlugin;
