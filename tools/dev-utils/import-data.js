'use strict';

/* eslint-env browser */
/* global chrome:false */

(function () {
    const div = document.body.appendChild(document.createElement('div'));
    div.style.position = 'fixed';
    div.style.top = '10px';
    div.style.left = '10px';

    const input = div.appendChild(document.createElement('input'));
    input.type = 'file';
    input.addEventListener('change', () => {
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = function () {
            const data = JSON.parse(reader.result);
            chrome.storage.local.set(data, () => {
                alert('Done!');
            });
        };
        reader.readAsText(file);
    });
})();
