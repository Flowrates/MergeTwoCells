/* eslint-disable no-undef, sort-keys */
module.exports = {
    env: {
        browser: true,
        es6: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        'plugin:switch-case/recommended',
    ],
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: 2018,
        sourceType: 'module',
    },
    plugins: [
        '@typescript-eslint',
        'import',
        'react',
        'react-hooks',
        'switch-case',
    ],
    rules: {
        'comma-dangle': ['error', 'always-multiline'],
        'import/newline-after-import': ['error', { 'count': 3, 'considerComments': true }],
        'import/no-default-export': 'error',
        'import/order': ['error', {
            'alphabetize': { 'order': 'asc', 'caseInsensitive': false },
            'distinctGroup': true,
            'groups': [
                'builtin',
                'external',
                'internal',
                'sibling',
                'index',
                'object',
                'type',
            ],
            'newlines-between': 'always',
            'pathGroups': [{
                'group': 'external',
                'pattern': '@**/**',
                'position': 'after',
            }],
            'pathGroupsExcludedImportTypes': ['builtin', 'object'],
        }],
        'indent': ['error', 4, { 'SwitchCase': 1 }],
        'jsx-quotes': ['error', 'prefer-single'],
        'linebreak-style': ['error', 'unix'],
        'no-trailing-spaces': 'error',
        'object-curly-newline': [ 'error', { 'multiline': true, 'minProperties': 4 }],
        'object-curly-spacing': ['error', 'always'],
        'padding-line-between-statements': [
            'error',
            { blankLine: 'always', prev: '*', next: 'function' },
            { blankLine: 'always', prev: 'function', next: '*' },
            { blankLine: 'always', prev: '*', next: 'return' },
            { blankLine: 'always', prev: '*', next: 'break' },
        ],
        'quotes': ['error', 'single'],
        'react/jsx-indent': [2, 4, { indentLogicalExpressions: true, checkAttributes: true }],
        'react/jsx-max-props-per-line': [1, { 'maximum': { single: 3, multi: 1 } }],
        'react/prop-types': 0,
        'react-hooks/exhaustive-deps': 'warn',
        'react-hooks/rules-of-hooks': 'error',
        'semi': ['error', 'never'],
        'sort-imports': ['error', {
            'ignoreCase': false,
            'ignoreDeclarationSort': true,
            'ignoreMemberSort': false,
            'allowSeparatedGroups': true,
        }],
        'sort-keys': ['error', 'asc', {
            'allowLineSeparatedGroups': true,
            'caseSensitive': true,
            'minKeys': 3,
            'natural': true,
        }],
        'switch-case/newline-between-switch-case': ['error', 'always', { 'fallthrough': 'never' }],
        'switch-case/no-case-curly': ['off'],
    },
    overrides: [
        {
            files: ['*.ts', '*.tsx'],
            parserOptions: {
                tsconfigRootDir: __dirname,
                project: ['./frontend/tsconfig.json'],
            },
            rules: {
                '@typescript-eslint/switch-exhaustiveness-check': 'error',
                '@typescript-eslint/explicit-module-boundary-types': ['error'],
            },
        },
    ],
    settings: { react: { version: 'detect' } },
}
