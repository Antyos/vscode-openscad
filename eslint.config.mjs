import eslint from '@eslint/js';
import eslintPluginImport from 'eslint-plugin-import';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    eslint.configs.recommended,
    tseslint.configs.recommended,
    prettierRecommended,
    eslintPluginImport.flatConfigs.recommended,
    {
        ignores: ['**/*.d.ts', 'dist/*'],
        plugins: {
            '@typescript-eslint': tseslint.plugin,
            'simple-import-sort': simpleImportSort,
            unicorn: eslintPluginUnicorn,
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
            // 'unicorn/import-style': 'off',
            // From vscode-ext preset at:
            // https://github.com/alefragnani/eslint-config-vscode-ext/blob/master/index.js
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-unused-vars': 'warn',
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-non-null-assertion': 'warn',
        },
    }
);
