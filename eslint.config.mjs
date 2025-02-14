import prettier from 'eslint-plugin-prettier';
import pluginSimpleImportSort from 'eslint-plugin-simple-import-sort';
import pluginImport from 'eslint-plugin-import';
import unicorn from 'eslint-plugin-unicorn';
import { fixupPluginRules } from '@eslint/compat';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tseslint from 'typescript-eslint';
import eslint from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: eslint.configs.recommended,
    allConfig: eslint.configs.all,
});

export default [
    {
        ignores: ['**/*.d.ts', 'dist/*'],
    },
    ...compat.extends(
        'vscode-ext',
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:unicorn/recommended',
        'prettier'
    ),
    {
        plugins: {
            '@typescript-eslint': tseslint.plugin,
            prettier,
            'simple-import-sort': pluginSimpleImportSort,
            import: fixupPluginRules(pluginImport),
            unicorn,
        },

        languageOptions: {
            parser: tseslint.parser,
            ecmaVersion: 6,
            sourceType: 'module',
        },

        rules: {
            'prettier/prettier': [
                'warn',
                {
                    endOfLine: 'auto',
                    singleQuote: true,
                },
            ],

            'simple-import-sort/imports': [
                'warn',
                {
                    groups: [['^\\u0000'], ['^@?\\w'], ['^'], ['^src', '^\\.']],
                },
            ],

            'simple-import-sort/exports': 'warn',
            'import/first': 'error',
            'import/newline-after-import': 'error',
            'import/no-duplicates': 'error',
            'no-trailing-spaces': 'warn',
            'eol-last': ['warn', 'always'],
            // We don't need these disabled since we're now on Nodejs>16
            'unicorn/prefer-node-protocol': 'off',
            'unicorn/import-style': 'off',
        },
    },
];
