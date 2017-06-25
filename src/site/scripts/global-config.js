(function () {
    'use strict';

    document.addEventListener("DOMContentLoaded", () => {
        const app = document.querySelector('rester-app');
        app.setAttribute('theme', localStorage.theme || 'dark');
    });
})();
