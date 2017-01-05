const path = require('path');
const fs = require('fs');
const gutil = require('gulp-util');
const through = require('through2');
const parse5 = require('parse5');


function readFileAsBuffer(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, (err, contents) => {
            if (err) {
                reject(err);
            } else {
                resolve(contents);
            }
        });
    });
}

module.exports = function () {
    const added = {};

    function importSources(stream, file) {
        if (file.isNull()) {
            return Promise.resolve(file);
        }

        if (file.isStream()) {
            return Promise.reject(new gutil.PluginError('add-html-import-sources', 'Streaming not supported'));
        }

        const fragment = parse5.parseFragment(file.contents.toString());

        const importUrls = fragment.childNodes
            .filter(node => node.nodeName === 'link' &&
                node.attrs.some(attr => attr.name === 'rel' && attr.value === 'import'))
            .map(node => node.attrs.find(attr => attr.name === 'href').value);

        const scriptUrls = fragment.childNodes
            .filter(node => node.nodeName === 'script' &&
                node.attrs.some(attr => attr.name === 'src'))
            .map(node => node.attrs.find(attr => attr.name === 'src').value);

        const promises = importUrls.concat(scriptUrls).map(url => {
            const absolutePath = path.join(path.dirname(file.path), url);

            if (added[absolutePath]) return;
            added[absolutePath] = true;

            return readFileAsBuffer(absolutePath).then(contents => {
                const newFile = new gutil.File({
                    cwd: file.cwd,
                    base: file.base,
                    path: absolutePath,
                    contents: contents
                });

                if (url.endsWith('.html')) {
                    return importSources(stream, newFile).then(() => {
                        stream.push(newFile);
                    });
                } else {
                    stream.push(newFile);
                }
            });
        });

        return Promise.all(promises).then(() => file);
    }

    return through.obj(function (file, enc, cb) {
        importSources(this, file)
            .then(result => cb(null, result))
            .catch(err => cb(err));
    });
};
