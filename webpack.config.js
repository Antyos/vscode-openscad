/* global __dirname */
/* eslint-env commonjs */
/* eslint-disable @typescript-eslint/no-var-requires */

//@ts-check
'use strict';

//@ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/

const path = require('path');
const webpack = require('webpack');

/** @type WebpackConfig */
const nodeConfig = {
    target: 'node',
    mode: 'none',
    entry: {
        extension: './src/extension.ts',
    },
    output: {
        filename: '[name].js',
        path: path.join(__dirname, 'lib', 'node'),
        libraryTarget: 'commonjs',
    },
    devtool: 'nosources-source-map',
    resolve: {
        extensions: ['.ts', '.js'],
        // alias: {
        //     debug: path.join(__dirname, 'polyfill', 'debug.js'),
        // },
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
};

/** @type WebpackConfig */
const browserConfig = {
    target: 'webworker', // extensions run in a webworker context
    mode: 'none', // this leaves the source code as close as possible to the original (when packaging we set this to 'production')
    entry: {
        extensionWeb: './src/web/extensionWeb.ts',
        // 'test/suite/index': './src/web/test/suite/index.ts',
    },
    output: {
        filename: '[name].js',
        path: path.join(__dirname, './dist/web'),
        libraryTarget: 'commonjs',
        devtoolModuleFilenameTemplate: '../../[resource-path]',
    },
    resolve: {
        mainFields: ['browser', 'module', 'main'], // look for `browser` entry point in imported node modules
        extensions: ['.ts', '.js'], // support ts-files and js-files
        // alias: {
        //     // provides alternate implementation for node module and source files
        // },
        // fallback: {
        //     // Webpack 5 no longer polyfills Node.js core modules automatically.
        //     // see https://webpack.js.org/configuration/resolve/#resolvefallback
        //     // for the list of Node.js core module polyfills.
        //     // assert: require.resolve('assert'),
        // },
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
    plugins: [
        new webpack.ProvidePlugin({
            process: 'process/browser', // provide a shim for the global `process` variable
        }),
    ],
    externals: {
        vscode: 'commonjs vscode', // ignored because it doesn't exist
    },
    performance: {
        hints: false,
    },
    devtool: 'nosources-source-map', // create a source map that points to the original source file
    infrastructureLogging: {
        level: 'log', // enables logging required for problem matchers
    },
};

module.exports = [nodeConfig, browserConfig];
