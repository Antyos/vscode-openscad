/// <reference types="node" />

import * as path from 'node:path';
import { Configuration, EnvironmentPlugin, ProvidePlugin } from 'webpack';

import extensionPackage from './package.json';

// eslint-disable-next-line unicorn/prefer-module
const projectRoot = __dirname;

const nodeConfig: Configuration = {
    // VS Code client extensions run in Node context. See: https://webpack.js.org/configuration/node/
    target: 'node',
    // Leaves the source code as close as possible to the original (when packaging we set this to 'production')
    mode: 'none',
    // Entry point into extension (in package.json). See: https://webpack.js.org/configuration/entry-context/
    entry: {
        'extension.node': './src/extension.node.ts',
    },
    // Bundle output location. See: https://webpack.js.org/configuration/output/
    output: {
        filename: '[name].js',
        path: path.join(projectRoot, 'dist'),
        libraryTarget: 'commonjs',
        devtoolModuleFilenameTemplate: '../[resource-path]',
    },
    plugins: [
        new EnvironmentPlugin({
            EXTENSION_NAME: `${extensionPackage.publisher}.${extensionPackage.name}`,
            EXTENSION_VERSION: extensionPackage.version,
        }),
    ],
    devtool: 'nosources-source-map',
    // Support reading TypeScript and JavaScript files. See: https://github.com/TypeStrong/ts-loader
    resolve: {
        extensions: ['.ts', '.js'],
        alias: {
            src: path.resolve(projectRoot, 'src'),
        },
    },
    // Modules that cannot be added through Webpack. See: https://webpack.js.org/configuration/externals/
    externals: {
        vscode: 'commonjs vscode', // ignored because 'vscode' module is created on the fly and doesn't really exist
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'ts-loader',
                    },
                ],
            },
        ],
    },
    performance: {
        hints: false,
    },
    infrastructureLogging: {
        level: 'log', // enables logging required for problem matchers
    },
};

const browserConfig: Configuration = {
    // extensions run in a webworker context
    ...nodeConfig,
    target: 'webworker',
    entry: {
        'extension.web': './src/extension.web.ts',
        // 'test/suite/index': './src/web/test/suite/index.ts',
    },
    resolve: {
        ...nodeConfig.resolve,
        mainFields: ['browser', 'module', 'main'], // look for `browser` entry point in imported node modules
    },
    plugins: [
        new ProvidePlugin({
            process: 'process/browser', // provide a shim for the global `process` variable
        }),
    ],
};

// eslint-disable-next-line unicorn/prefer-module
module.exports = [nodeConfig, browserConfig];
