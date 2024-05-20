import babelParser from '@babel/eslint-parser';
import js from '@eslint/js';
import globals from 'globals';

export default [
    js.configs.recommended,
    {
        ignores: ['build/**'],
    },
    {
        languageOptions: {
            parser: babelParser,
        },
    },
    {
        ignores: ['src/**'],
        languageOptions: {
            sourceType: 'script',
            globals: {
                ...globals.node,
            },
        },
    },
    {
        files: ['src/**/*.js'],
        ignores: [
            'src/site/elements/data/workers/**',
            '**/*.test.js',
            '**/__mocks__/**',
        ],
        languageOptions: {
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.webextensions,
            },
        },
    },
    {
        files: ['src/site/**/*.js'],
        ignores: [
            'src/site/elements/data/workers/**',
            '**/*.test.js',
            '**/__mocks__/**',
        ],
        languageOptions: {
            globals: {
                ace: 'readonly',
            },
        },
    },
    {
        files: ['src/site/scripts/**/*.js'],
        languageOptions: {
            sourceType: 'script',
        },
    },
    {
        files: ['src/site/elements/data/workers/**/*.js'],
        languageOptions: {
            sourceType: 'script',
            globals: {
                ...globals.worker,
                resterFormatJson: 'readonly',
                vkbeautify: 'readonly',
            },
        },
    },
    {
        files: ['test-e2e/**/*.{js,mjs}', '**/*.test.js', '**/__mocks__/**/*.js'],
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.jest,
            },
        },
    },
    {
        files: ['tools/dev-utils/import-data.js'],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.webextensions,
            },
        },
    },
];
