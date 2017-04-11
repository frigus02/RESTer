(function () {
    'use strict';

    window.Polymer = {
        dom: 'shadow',
        lazyRegister: true,
        useNativeCSSProperties: true,
        suppressTemplateNotifications: true,
        suppressBindingNotifications: true
    };

    document.addEventListener("DOMContentLoaded", () => {
        const app = document.querySelector('rester-app');
        app.setAttribute('theme', localStorage.theme || 'dark');
    });
})();
