'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const addonsLinter = require('addons-linter');
const chalk = require('chalk');
const logSymbols = require('log-symbols');
const plur = require('plur');


/**
 * Lints a Firefox addon.
 *
 * @param  {Object} options
 *     - `addonDir` Directory of the addon code (e.g. '.package/firefox-1.17.0/').
 * @return {Promise}
 */
function lintFirefoxAddon(options) {
    const linter = addonsLinter.createInstance({
        config: {
            logLevel: 'fatal',
            selfHosted: false,

            // This mimics the first command line argument from yargs,
            // which should be the directory to the extension.
            _: [options.addonDir]
        }
    });

    return linter.extractMetadata()
        .then(() => {
            return linter.io.getFiles();
        })
        .then(files => {
            // Known libraries do not need to be scanned
            const filesWithoutJSLibraries = Object.keys(files).filter((file) => {
                return !linter.addonMetadata.jsLibs.hasOwnProperty(file);
            }, this);
            return linter.scanFiles(filesWithoutJSLibraries);
        })
        .then(() => {
            return getIgnoreList();
        })
        .then(ignoreList => {
            const result = linter.output;
            const lists = ['notices', 'warnings', 'errors'];

            result.count = 0;
            for (let list of lists) {
                result[list] = result[list].filter(message => {
                    const file = path.resolve(message.file);

                    return !ignoreList.some(ignore =>
                        ignore.file === file &&
                        ignore.code === message.code);
                });

                result.summary[list] = result[list].length;
                result.count += result[list].length;
            }

            reportResult(result);

            if (result.count > 0) {
                throw new Error(`Lint discovered ${result.count} errors.`);
            }
        });
}

function getIgnoreList() {
    const ignoreFile = path.join(process.cwd(), '.addonslinterignore');
    return new Promise(resolve => {
        const lineReader = readline.createInterface({
            input: fs.createReadStream(ignoreFile)
        });

        const ignore = [];

        lineReader.on('line', line => {
            line = line.trim();

            // Ignore comments and empty lines.
            if (!line || line.startsWith('#')) {
                return;
            }

            // Otherwise lines should have the following structure:
            // <file> <code>
            const [file, code] = line.split(' ');
            ignore.push({
                file: path.resolve(file),
                code
            });
        });

        lineReader.on('close', () => {
            resolve(ignore);
        });
    });
}

function reportResult(result) {
    /* eslint-disable no-console */

    const messages = [...result.errors, ...result.warnings, ...result.notices].sort((a, b) => {
        const file = a.file.localeCompare(b.file);
        if (file !== 0) {
            return file;
        }

        if (a.line !== b.line) {
            return a.line - b.line;
        }

        return a.column - b.column;
    });
    const colors = {
        error: 'red',
        warning: 'blue',
        notice: 'white'
    };

    let prevFile;
    messages.forEach(message => {
        if (prevFile !== message.file) {
            console.log(chalk.underline(message.file));
            prevFile = message.file;
        }

        console.log([
            '',
            chalk.gray('line ' + message.line),
            chalk.gray('col ' + message.column),
            chalk[colors[message._type]](`${message.code} ${message.message}`)
        ].join(' '));
    });

    if (messages.length > 0) {
        console.log();

        if (result.summary.errors > 0) {
            console.log(' ' + logSymbols.error, ' ' + result.summary.errors + ' ' + plur('error', result.summary.errors));
        }

        if (result.summary.warnings > 0) {
            console.log(' ' + logSymbols.warning, ' ' + result.summary.warnings + ' ' + plur('warning', result.summary.warnings));
        }

        if (result.summary.notices > 0) {
            console.log(' ' + logSymbols.info, ' ' + result.summary.notices + ' ' + plur('notice', result.summary.notices));
        }
    }

    /* eslint-enable no-console */
}

module.exports = lintFirefoxAddon;
