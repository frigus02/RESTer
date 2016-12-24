(function () {

    const self = RESTer.register('encode');

    self.encodeQueryString = function (params) {
        return Object.keys(params)
            .map(p => `${p}=${encodeURIComponent(params[p])}`)
            .join('&');
    };

    self.decodeQueryString = function (str) {
        return str.split('&').reduce((params, currentParam) => {
            const keyValue = currentParam.split('=');
            params[keyValue[0]] = decodeURIComponent(keyValue[1]);
            return params;
        }, {});
    };

    self.generateUri = function (base, params) {
        return base + '?' + self.encodeQueryString(params);
    };

    self.readFileAsBase64CustomObject = function (file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.addEventListener('load', e => {
                // data:image/png;base64,XXXXXXXX
                const dataUri = e.target.result;

                resolve({
                    lastModified: file.lastModified,
                    name: file.name,
                    type: file.type,
                    data: dataUri.split(',')[1]
                });
            });

            reader.addEventListener('error', () => {
                reject();
            });

            reader.readAsDataURL(file);
        });
    };

    self.readFilesAsVariableValues = function (files) {
        const values = {},
              promises = [];

        for (let key in files) {
            if (files.hasOwnProperty(key)) {
                promises.push(self.readFileAsBase64CustomObject(files[key]).then(obj => {
                    values[`$file.${key}`] = obj;
                }));
            }
        }

        return Promise.all(promises).then(() => values);
    };

})();
