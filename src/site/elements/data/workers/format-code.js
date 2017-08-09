'use strict';

importScripts('../../../bower_components/vkbeautify/vkbeautify.js');


self.onmessage = function (event) {
    const result = format(event.data.code, event.data.language);
    postMessage(result);
};


function format(code, language) {
    if (language === 'json') {
        return vkbeautify.json(code, 4);
    } else if (language === 'xml') {
        return vkbeautify.xml(code, 4);
    }
}
