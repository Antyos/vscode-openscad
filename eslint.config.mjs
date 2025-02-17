import eslint from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import simpleImportSortPlugin from 'eslint-plugin-simple-import-sort';
import unicornPlugin from 'eslint-plugin-unicorn';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    { ignores: ['**/*.d.ts', 'dist/*'] },
    eslint.configs.recommended,
    // eslint-disable-next-line import/no-named-as-default-member
    tseslint.configs.recommended,
    prettierRecommended,
    importPlugin.flatConfigs.recommended,
    importPlugin.flatConfigs.typescript,
    {
        plugins: {
            'simple-import-sort': simpleImportSortPlugin,
            unicorn: unicornPlugin,
        },

        languageOptions: {
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
