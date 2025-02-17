import eslint from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import simpleImportSortPlugin from 'eslint-plugin-simple-import-sort';
import unicornPlugin from 'eslint-plugin-unicorn';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    eslint.configs.recommended,
    tseslint.configs.recommended,
    prettierRecommended,
    importPlugin.flatConfigs.recommended,
    importPlugin.flatConfigs.typescript,
    {
        ignores: ['**/*.d.ts', 'dist/*'],
        plugins: {
            // '@typescript-eslint': tseslint.plugin,
            'simple-import-sort': simpleImportSortPlugin,
            unicorn: unicornPlugin,
        },

        languageOptions: {
            // parser: tseslint.parser,
            ecmaVersion: 6,
            sourceType: 'module',
        },

        settings: {
            'import/resolver': {
                typescript: { alwaysTryTypes: true },
            },
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
                    // Default groups, but group 'src' with relative imports
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
    }
);
