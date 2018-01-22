(function () {
    'use strict';

    document.addEventListener("DOMContentLoaded", () => {
        const app = document.querySelector('rester-app');
        app.setAttribute('theme', localStorage.theme || 'dark');
    });

    document.addEventListener('WebComponentsReady', function () {
        const definitions = document.querySelectorAll('[data-script-src]');
        for (const definition of definitions) {
            const script = document.createElement('script');
            script.src = definition.dataset.scriptSrc;
            definition.parentNode.insertBefore(script, definition);
        }
    }, { once: true });
})();
