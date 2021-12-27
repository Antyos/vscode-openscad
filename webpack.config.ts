import * as path from 'node:path';
import { Configuration, ProvidePlugin } from 'webpack';

// eslint-disable-next-line unicorn/prefer-module
const projectRoot = __dirname;

const nodeConfig: Configuration = {
    // VS Code client extensions run in Node context. See: https://webpack.js.org/configuration/node/
    target: 'node',
    // Leaves the source code as close as possible to the original (when packaging we set this to 'production')
    mode: 'none',
    // Entry point into extension (in package.json). See: https://webpack.js.org/configuration/entry-context/
    entry: {
        extension: './src/extension.ts',
    },
    // Bundle output location. See: https://webpack.js.org/configuration/output/
    output: {
        filename: '[name].js',
        path: path.join(projectRoot, 'dist'),
        libraryTarget: 'commonjs',
    },
    devtool: 'nosources-source-map',
    // Support reading TypeScript and JavaScript files. See: https://github.com/TypeStrong/ts-loader
    resolve: {
        extensions: ['.ts', '.js'],
        // alias: {
        //     debug: path.join(__dirname, 'polyfill', 'debug.js'),
        // },
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
};

const browserConfig: Configuration = {
    // extensions run in a webworker context
    target: 'webworker',
    mode: 'none',
    entry: {
        'extension-web': './src/web/extension-web.ts',
        // 'test/suite/index': './src/web/test/suite/index.ts',
    },
    output: {
        filename: '[name].js',
        path: path.join(projectRoot, './dist/web'),
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
        new ProvidePlugin({
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

// eslint-disable-next-line unicorn/prefer-module
module.exports = [nodeConfig, browserConfig];
