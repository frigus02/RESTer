/* globals hljs:false */

'use strict';

importScripts('../../other_components/highlightjs/highlight.pack.js');
importScripts('../../other_components/vkbeautify/vkbeautify.js');


self.onmessage = function (event) {
    var result = highlight(event.data.code, event.data.language);
    postMessage(result);
};


function format(code, language) {
    if (language === 'json') {
        return vkbeautify.json(code, 4);
    } else if (language === 'xml') {
        return vkbeautify.xml(code, 4);
    }
}

function highlight(code, language) {
    var highlightedCode,
        highlightedFormattedCode,
        result,
        formattedCode,
        formattedResult;

    if (language && hljs.getLanguage(language)) {
        result = hljs.highlight(language, code);
    } else if (language === 'plain') {
        result = {
            language: 'plain',
            value: code
        };
    } else {
        result = hljs.highlightAuto(code);
    }

    language = result.language;
    highlightedCode = result.value;

    formattedCode = format(code, language);
    if (formattedCode) {
        formattedResult = hljs.highlight(language, formattedCode);
        highlightedFormattedCode = formattedResult.value;
    }

    return {
        language: language,
        highlightedCode: highlightedCode,
        highlightedFormattedCode: highlightedFormattedCode
    };
}
