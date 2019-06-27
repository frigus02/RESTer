'use strict';

const fs = require('fs');
const { promisify } = require('util');

const writeFile = promisify(fs.writeFile);

function generateUsedLibraries(webPackFiles) {
    const libraries = Array.from(webPackFiles.files)
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

    return Object.keys(libraries)
        .sort()
        .map(lib => {
            const usedFiles = libraries[lib];
            const packageJson = require(`../../node_modules/${lib}/package.json`);

            return {
                name: lib,
                packageJson,
                usedFiles
            };
        });
}

function stripCwd(filename) {
    return filename.substr(process.cwd().length + 1);
}

function normalizeFileName(filename) {
    return filename.replace(/\\/g, '/');
}

class WebPackFiles {
    constructor() {
        this.files = new Set();
    }

    update(compilation) {
        const newFiles = [
            ...Object.keys(compilation.assets),
            ...Array.from(compilation.fileDependencies).map(stripCwd)
        ].map(normalizeFileName);

        for (const file of newFiles) {
            this.files.add(file);
        }
    }
}

/**
 * Generates a file with a list of used libraries by collecting all file
 * names. This useful for addon reviewers to get a quick overview over 3rd
 * party libraries used in this extension.
 *
 * @param {object} options
 * @param {string} options.filename - Name of the generated file.
 * @param {string} options.header - Content at start of generated file.
 * @param {string} options.footer - Content at end of generated file.
 */
class GenerateLibraryLinksPlugin {
    constructor(options) {
        this.options = options;
        this.files = new WebPackFiles();
    }

    apply(compiler) {
        const options = this.options;
        compiler.hooks.emit.tapPromise(
            'GenerateLibraryLinksPlugin',
            async compilation => {
                this.files.update(compilation);
                const libraries = generateUsedLibraries(this.files);
                const text = libraries
                    .map(lib => {
                        const { name, version } = lib.packageJson;
                        const fileUrls = lib.usedFiles.map(
                            file =>
                                `https://unpkg.com/${name}@${version}/${file}`
                        );
                        return `${name} ${version}\n${fileUrls.join('\n')}`;
                    })
                    .join('\n\n');
                const fileContent = options.header + text + options.footer;

                await writeFile(options.filename, fileContent, 'utf8');
            }
        );
    }
}

/**
 * Generates a JSON file with a list of used libraries by collecting all file
 * names. This is used on about page to give credit to 3rd party libraries.
 *
 * @param {object} options
 * @param {string} options.filename - Name of the generated file.
 */
class GenerateAboutLibrariesPlugin {
    constructor(options) {
        this.options = options;
        this.files = new WebPackFiles();
    }

    apply(compiler) {
        const options = this.options;
        compiler.hooks.emit.tapPromise(
            'GenerateAboutLibrariesPlugin',
            async compilation => {
                this.files.update(compilation);
                const libraries = generateUsedLibraries(this.files);
                const text = JSON.stringify(
                    libraries.map(lib => ({
                        name: lib.packageJson.name,
                        version: lib.packageJson.version,
                        url: `https://www.npmjs.com/package/${lib.packageJson.name}`
                    }))
                );

                compilation.assets[options.filename] = {
                    source: () => text,
                    size: () => text.length
                };
            }
        );
    }
}

module.exports = { GenerateLibraryLinksPlugin, GenerateAboutLibrariesPlugin };
