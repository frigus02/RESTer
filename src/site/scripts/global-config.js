(function () {
    'use strict';

    document.addEventListener("DOMContentLoaded", () => {
        const app = document.querySelector('rester-app');
        app.setAttribute('theme', localStorage.theme || 'dark');
    });

    document.addEventListener('WebComponentsReady', function () {
        const scripts = document.querySelectorAll('[data-src]');
        for (const script of scripts) {
            script.src = script.dataset.src;
        }
    }, { once: true });
})();
