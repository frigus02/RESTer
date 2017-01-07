const fs = require('fs');
const path = require('path');

const jpmUtils = require('jpm/lib/utils');
const jpmXpi = require('jpm/lib/xpi');


/**
 * Creates the XPI for a Firefox addon using JPM.
 *
 * @param  {Object} options
 *     - `addonDir` Directory of the addon code (e.g. '.package/firefox-1.17.0/').
 *     - `destFile` Output directory for the XPI file (e.g. '.package/firefox-1.17.0.xpi').
 *     - `validateVersion` Validate version in addon manifest against this version.
 * @return {Promise}
 */
function createFirefoxAddon(options) {
    const jpmOptions = {
        addonDir: path.resolve(options.addonDir),
        destDir: path.dirname(path.resolve(options.destFile))
    };

    return jpmUtils.getManifest(jpmOptions).then(manifest => {
        if (Object.keys(manifest).length === 0) {
            throw new Error('Manifest not found.');
        }

        if (options.validateVersion && manifest.version !== options.validateVersion) {
            throw new Error(`Version in addon manifest (${manifest.version}) does not match validated version (${options.validateVersion}).`);
        }

        return jpmXpi(manifest, jpmOptions);
    }).then(xpiPath => {
        return renameFile(xpiPath, options.destFile);
    });
}

function renameFile(from, to) {
    return new Promise((resolve, reject) => {
        fs.rename(from, to, err => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

module.exports = createFirefoxAddon;
