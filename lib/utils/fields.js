'use strict';

function prepareFields(fields) {
    return fields.map(field => field.split('.'));
}

function filterProperties(obj, fields) {
    const result = {};

    for (let fieldPath of fields) {
        let curResult = result,
            curObj = obj;

        for (let i = 0; i < fieldPath.length; i++) {
            let field = fieldPath[i],
                isLast = i === fieldPath.length - 1;

            if (!curObj.hasOwnProperty(field)) {
                break;
            }

            if (!curResult.hasOwnProperty(field)) {
                if (isLast) {
                    curResult[field] = curObj[field];
                } else {
                    curResult[field] = {};
                }
            }

            curResult = curResult[field];
            curObj = curObj[field];
        }
    }

    return result;
}

exports.select = function (data, fields) {
    fields = prepareFields(fields);

    if (Array.isArray(data)) {
        return data.map(item => filterProperties(item, fields));
    } else {
        return filterProperties(data, fields);
    }
};
