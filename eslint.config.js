const globals = require('globals');
const pluginJs = require('@eslint/js');
const prettier = require('eslint-config-prettier');
const jest = require('eslint-plugin-jest');

module.exports = [
    {
        ignores: ['node_modules', 'dist', 'coverage'],
    },
    {
        languageOptions: {
            globals: {
                ...globals.node,
            },
            ecmaVersion: 'latest',
            sourceType: 'commonjs',
        },
    },
    pluginJs.configs.recommended,
    prettier,
    {
        files: ['**/*.test.js'],
        ...jest.configs['flat/recommended'],
        rules: {
            ...jest.configs['flat/recommended'].rules,
        },
    },
    {
        rules: {
            'no-console': 'off',
            'no-underscore-dangle': 'off',
            'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        },
    },
];
