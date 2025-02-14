/* eslint-disable unicorn/no-process-exit */
/* eslint-disable unicorn/prefer-module */
// We cannot use top level await unless we change the target to ES2022 or later
/* eslint-disable unicorn/prefer-top-level-await */

import { runTests } from '@vscode/test-electron';
import * as path from 'path';

async function main() {
    try {
        // The folder containing the Extension Manifest package.json
        // Passed to `--extensionDevelopmentPath`
        const extensionDevelopmentPath = path.resolve(__dirname, '../../');

        // The path to the extension test runner script
        // Passed to --extensionTestsPath
        const extensionTestsPath = path.resolve(__dirname, './index');

        // Download VS Code, unzip it and run the integration test
        await runTests({ extensionDevelopmentPath, extensionTestsPath });
    } catch (error) {
        console.error(error);
        console.error('Failed to run tests');
        process.exit(1);
    }
}

main();
