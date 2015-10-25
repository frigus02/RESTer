'use strict';

module.exports = function (fn, argumentCount) {
    argumentCount = argumentCount || Infinity;

    return function () {
        let self = this,
            args = Array.prototype.slice.call(arguments, 0, argumentCount > 0 ? argumentCount : 0);

        return new Promise(function (resolve, reject) {
            args.push(function (err, res) {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });

            let res = fn.apply(self, args);
            if (res && (typeof res === 'object' || typeof res === 'function') && typeof res.then === 'function') {
                resolve(res);
            }
        });
    };
};
