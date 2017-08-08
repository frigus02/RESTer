/* eslint-disable no-console */

'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const addonsLinter = require('addons-linter');
const chalk = require('chalk');
const logSymbols = require('log-symbols');
const plur = require('plur');

const ignoreFileName = '.addonslinterignore';


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
            // This mimics the first command line argument from yargs,
            // which should be the directory to the extension.
            _: [options.addonDir],
            logLevel: process.env.VERBOSE ? 'debug' : 'fatal',
            stack: Boolean(process.env.VERBOSE),
            pretty: false,
            warningsAsErrors: false,
            metadata: false,
            output: 'none',
            boring: false,
            selfHosted: false
        },
        runAsBinary: false
    });

    return linter.run()
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

                    const ignoreEntry = ignoreList.find(ignore =>
                        ignore.file === file &&
                        ignore.code === message.code);
                    if (ignoreEntry) {
                        ignoreEntry.used = true;
                        return false;
                    } else {
                        return true;
                    }
                });

                result.summary[list] = result[list].length;
                result.count += result[list].length;
            }

            reportResult(result);

            const unusedIgnoreEntries = ignoreList.filter(ignore => !ignore.used);
            if (unusedIgnoreEntries.length > 0) {
                console.log(`Unused entries in ${ignoreFileName}:`);
                for (const ignoreEntry of unusedIgnoreEntries) {
                    console.log(` ${ignoreEntry.file} ${ignoreEntry.code}`);
                }
            }

            if (result.count > 0) {
                throw new Error(`Lint discovered ${result.count} errors.`);
            }
        });
}

function getIgnoreList() {
    const ignoreFile = path.join(process.cwd(), ignoreFileName);
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
            let [file, code] = line.split(' ');

            // Some codes sentences instead of short, uppercase names. In
            // this case the code should start with "_" in the ignore file
            // and all spaces should be replaced by "_".
            if (code.startsWith('_')) {
                code = code.substr(1).replace(/_/g, ' ');
            }

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

        let location;
        if (message.line || message.column) {
            location = `line ${message.line} col ${message.column}`;
        } else if (message.dataPath) {
            location = `data path ${message.dataPath}`;
        } else {
            location = 'unknown location';
        }

        console.log([
            '',
            chalk.gray(location),
            chalk[colors[message._type]](`${message.code} ${message.message}`)
        ].join(' '));

        if (message.description) {
            console.log(`  ${message.description}`);
        }
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
