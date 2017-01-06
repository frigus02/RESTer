const gutil = require('gulp-util');
const through = require('through2');


module.exports = function (additionalKeys) {
    function enhanceManifestJson(stream, file) {
        if (file.isNull()) {
            return Promise.resolve(file);
        }

        if (file.isStream()) {
            return Promise.reject(new gutil.PluginError('add-html-import-sources', 'Streaming not supported'));
        }

        if (file.relative !== 'manifest.json') {
            return Promise.resolve(file);
        }

        const manifest = JSON.parse(file.contents.toString());

        // Add additional keys.
        Object.assign(manifest, additionalKeys);

        file.contents = new Buffer(JSON.stringify(manifest, null, 4));
        return Promise.resolve(file);
    }

    return through.obj(function (file, enc, cb) {
        enhanceManifestJson(this, file)
            .then(result => cb(null, result))
            .catch(err => cb(err));
    });
};
