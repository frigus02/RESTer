'use strict';

importScripts(
    '../../../node_modules/frigus02-vkbeautify/vkbeautify.js',
    '../scripts/format-json.js'
);

self.onmessage = function (event) {
    const result = format(event.data.code, event.data.language);
    postMessage(result);
};

function format(code, language) {
    if (language === 'json') {
        return resterFormatJson.formatJson(code);
    } else if (language === 'xml') {
        return vkbeautify.xml(code, 4);
    }
}
