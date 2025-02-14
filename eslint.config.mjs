import typescriptEslint from "@typescript-eslint/eslint-plugin";
import prettier from "eslint-plugin-prettier";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import _import from "eslint-plugin-import";
import unicorn from "eslint-plugin-unicorn";
import { fixupPluginRules } from "@eslint/compat";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [{
    ignores: ["**/*.d.ts", "dist/*"],
}, ...compat.extends(
    "vscode-ext",
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:unicorn/recommended",
    "prettier",
), {
    plugins: {
        "@typescript-eslint": typescriptEslint,
        prettier,
        "simple-import-sort": simpleImportSort,
        import: fixupPluginRules(_import),
        unicorn,
    },

    languageOptions: {
        parser: tsParser,
        ecmaVersion: 6,
        sourceType: "module",
    },

    rules: {
        "prettier/prettier": ["warn", {
            endOfLine: "auto",
            singleQuote: true,
        }],

        "simple-import-sort/imports": ["warn", {
            groups: [["^\\u0000"], ["^@?\\w"], ["^"], ["^src", "^\\."]],
        }],

        "simple-import-sort/exports": "warn",
        "import/first": "error",
        "import/newline-after-import": "error",
        "import/no-duplicates": "error",
        "no-trailing-spaces": "warn",
        "eol-last": ["warn", "always"],
        "unicorn/prefer-node-protocol": "off",
        "unicorn/import-style": "off",
    },
}];