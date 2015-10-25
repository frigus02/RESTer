/* globals hljs:false */

'use strict';

importScripts('../../other_components/highlightjs/highlight.pack.js');


self.onmessage = function (event) {
    var result = highlight(event.data.code, event.data.language);
    postMessage(result);
};


function format(code, language) {
    if (language === 'json') {
        return JSON.stringify(JSON.parse(code), null, 4);
    }
}

function highlight(code, language) {
    var highlightedCode,
        highlightedFormattedCode,
        result,
        formattedCode,
        formattedResult;

    if (language) {
        result = hljs.highlight(language, code);
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
