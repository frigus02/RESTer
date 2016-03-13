'use strict';

angular.module('app')
    .service('$variables', [function () {
        const RE_VARS = /\{(\S+?)\}/gi;

        let self = this;

        self.extract = function (obj) {
            let vars = [];

            if (typeof obj === 'string') {
                let matches = obj.match(RE_VARS);
                if (matches) {
                    vars.push(matches.map(m => m.substr(1, m.length - 2)));
                }
            } else if (typeof obj === 'object' && obj !== null) {
                Object.keys(obj).forEach(key => {
                    vars.push(self.extract(obj[key]));
                });
            }

            return _.union(...vars);
        };

        self.replace = function (obj, values) {
            if (typeof obj === 'string') {
                obj = obj.replace(RE_VARS, match => {
                    let varName = match.substr(1, match.length - 2);
                    return values[varName];
                });
            } else if (typeof obj === 'object' && obj !== null) {
                obj = _.clone(obj);
                Object.keys(obj).forEach(key => {
                    obj[key] = self.replace(obj[key], values);
                });
            }

            return obj;
        };
    }]);
