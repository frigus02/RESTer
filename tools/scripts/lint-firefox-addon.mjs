/* eslint-disable no-console */

'use strict';

import { createReadStream } from 'fs';
import { resolve as resolvePath } from 'path';
import { createInterface } from 'readline';

import { createInstance } from 'addons-linter';
import chalk from 'chalk';
import logSymbols from 'log-symbols';

const ignoreFileName = '.addonslinterignore';
const noFileToken = '<no_file>';

/**
 * Lints a Firefox addon.
 *
 * @param  {Object} options
 *     - `addonDir` Directory of the addon code (e.g. 'package/firefox-1.17.0/').
 * @return {Promise}
 */
async function lintFirefoxAddon(options) {
    const ignoreList = await getIgnoreList();

    const linter = createInstance({
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
            selfHosted: false,
        },
        runAsBinary: false,
    });

    await linter.run();

    const result = linter.output;
    const lists = ['notices', 'warnings', 'errors'];

    result.count = 0;
    for (let list of lists) {
        result[list] = result[list].filter((message) => {
            const file = message.file ? resolvePath(message.file) : noFileToken;
            const ignoreEntry = ignoreList.find(
                (ignore) => ignore.file === file && ignore.code === message.code
            );
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

    const unusedIgnoreEntries = ignoreList.filter((ignore) => !ignore.used);
    if (unusedIgnoreEntries.length > 0) {
        console.log(`Unused entries in ${ignoreFileName}:`);
        for (const ignoreEntry of unusedIgnoreEntries) {
            console.log(` ${ignoreEntry.file} ${ignoreEntry.code}`);
        }
    }

    if (result.count > 0) {
        throw new Error(`Lint discovered ${result.count} errors.`);
    }
}

function getIgnoreList() {
    const ignoreFile = new URL('../../' + ignoreFileName, import.meta.url);
    return new Promise((resolve) => {
        const lineReader = createInterface({
            input: createReadStream(ignoreFile),
        });

        const ignore = [];

        lineReader.on('line', (line) => {
            line = line.trim();

            // Ignore comments and empty lines.
            if (!line || line.startsWith('#')) {
                return;
            }

            // Otherwise lines should have the following structure:
            // <file> <code>
            let [file, code] = line.split(' ');

            if (file !== noFileToken) {
                file = resolvePath(file);
            }

            // Some codes sentences instead of short, uppercase names. In
            // this case the code should start with "_" in the ignore file
            // and all spaces should be replaced by "_".
            if (code.startsWith('_')) {
                code = code.substr(1).replace(/_/g, ' ');
            }

            ignore.push({ file, code });
        });

        lineReader.on('close', () => {
            resolve(ignore);
        });
    });
}

function reportResult(result) {
    const messages = [
        ...result.errors,
        ...result.warnings,
        ...result.notices,
    ].sort((a, b) => {
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
        notice: 'white',
    };

    let prevFile;
    messages.forEach((message) => {
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

        console.log(
            [
                '',
                chalk.gray(location),
                chalk[colors[message._type]](
                    `${message.code} ${message.message}`
                ),
            ].join(' ')
        );

        if (message.description) {
            console.log(`  ${message.description}`);
        }
    });

    if (messages.length > 0) {
        console.log();

        if (result.summary.errors > 0) {
            console.log(
                ' ' + logSymbols.error,
                ' ' + result.summary.errors + ' error(s)'
            );
        }

        if (result.summary.warnings > 0) {
            console.log(
                ' ' + logSymbols.warning,
                ' ' + result.summary.warnings + ' warning(s)'
            );
        }

        if (result.summary.notices > 0) {
            console.log(
                ' ' + logSymbols.info,
                ' ' + result.summary.notices + ' notice(s)'
            );
        }
    }
}

async function main() {
    await lintFirefoxAddon({
        addonDir: resolvePath(process.argv[2]),
    });
}

main().catch((err) => {
    console.error(err.stack);
    process.exitCode = 1;
});
