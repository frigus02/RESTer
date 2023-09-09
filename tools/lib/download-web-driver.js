'use strict';

const geckodriver = require('geckodriver');

module.exports = async () => {
    try {
        const envPath = process.env.PATH || '';
        const geckodriverPath = await geckodriver.download();
        process.env.PATH = `${geckodriverPath};${envPath}`;
    } catch (e) {
        console.error('geckodriver download failed', e);
        process.exit(1);
    }
};
