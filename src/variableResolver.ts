/*---------------------------------------------------------------------------------------------
 * Variable Resolver
 *
 * Resolves variables in a string with respect to a workspace or file
 *
 * Based on code from:
 * - https://github.com/microsoft/vscode/blob/9450b5e5fb04f2a180cfffc4d27f52f972b1f369/src/vs/workbench/services/configurationResolver/common/variableResolver.ts
 * - https://github.com/microsoft/vscode/blob/9f1aa3c9feecd04a79d22fd6752ba14a83b48f1b/src/vs/workbench/services/configurationResolver/browser/configurationResolverService.ts
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import * as path from 'path';
import { platform } from 'os';
import { existsSync, readdir, mkdirSync } from 'fs';
import { DEBUG } from './config';

import escapeStringRegexp = require('escape-string-regexp');

// Returns file name without extension
export function fileBasenameNoExt(uri: vscode.Uri): string {
    return path.basename(uri.fsPath, path.extname(uri.fsPath));
}

// Resolves variables in '${VAR_NAME}' format within a string
export class VariableResolver {
    // Regex patterns to identify variables
    private static readonly VARIABLE_REGEXP = /\$\{(.*?)\}/g;
    // private static readonly VARIABLE_REGEXP_SINGLE = /\$\{(.*?)\}/; // Unused
    private static readonly VERSION_FORMAT = /\${#}/g;

    private readonly _variables: string[] = [
        'workspaceFolder',
        'workspaceFolderBasename',
        'file',
        'relativeFile',
        'relativeFileDirname',
        'fileBasename',
        'fileBasenameNoExtension',
        'fileDirname',
        'fileExtname',
        'exportExtension',
        '#',
        'noMatch',
    ];

    private readonly _defaultPattern =
        '${fileBasenameNoExtension}.${exportExtension}'; // Default naming pattern
    private readonly _isWindows: boolean;
    // private _config: ScadConfig;

    constructor() {
        // this._config = config
        this._isWindows = platform() === 'win32';
    }

    // Resolve variables in string given a file URI
    public async resolveString(
        pattern: string = this._defaultPattern,
        resource: vscode.Uri,
        exportExt?: string
    ): Promise<string> {
        // if (DEBUG) console.log(`resolveString pattern: ${pattern}`); // DEBUG

        // Replace all variable pattern matches '${VAR_NAME}'
        const replaced = pattern.replace(
            VariableResolver.VARIABLE_REGEXP,
            (match: string, variable: string) => {
                const resolvedValue = this.evaluateSingleVariable(
                    match,
                    variable,
                    resource,
                    exportExt
                );

                return resolvedValue;
            }
        );

        // Get dynamic version number
        const version = await this.getVersionNumber(replaced, resource);

        if (DEBUG) console.log(`Version number: ${version}`);

        // Cases for version number
        switch (version) {
            case -1: // No version number
                return replaced;
            case -2: // Reached max version number\
                vscode.window.showErrorMessage(
                    `Could not read files in directory specified for export`
                );
                return replaced;
            default:
                // Substitute version number
                return replaced.replace(
                    VariableResolver.VERSION_FORMAT,
                    String(version)
                );
        }
    }

    // Tests all variables
    public testVars(resource: vscode.Uri): void {
        if (DEBUG) console.log('Testing evaluateSingleVariable()...');

        this._variables.forEach((variable) => {
            if (DEBUG)
                console.log(
                    `${variable} : ${this.evaluateSingleVariable(
                        '${' + variable + '}',
                        variable,
                        resource,
                        'test'
                    )}`
                );
        });
    }

    // Evaluate a single variable in format '${VAR_NAME}'
    // See https://code.visualstudio.com/docs/editor/variables-reference
    private evaluateSingleVariable(
        match: string,
        variable: string,
        resource: vscode.Uri,
        exportExt = 'scad'
    ): string {
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(resource)
            ?.uri.fsPath;

        switch (variable) {
            case 'workspaceFolder':
                return workspaceFolder || match;
            case 'workspaceFolderBasename':
                return path.basename(workspaceFolder || '') || match;
            case 'file':
                return resource.fsPath;
            case 'relativeFile':
                return path.relative(workspaceFolder || '', resource.fsPath);
            case 'relativeFileDirname':
                return path.basename(path.dirname(resource.fsPath));
            case 'fileBasename':
                return path.basename(resource.fsPath);
            case 'fileBasenameNoExtension':
                return fileBasenameNoExt(resource);
            case 'fileDirname':
                return path.dirname(resource.fsPath);
            case 'fileExtname':
                return path.extname(resource.fsPath);
            case 'exportExtension':
                if (exportExt) return exportExt;
                else return match;
            case '#':
            default:
                return match;
        }
    }

    // Evaluate version number in format '${#}'
    private async getVersionNumber(
        pattern: string,
        resource: vscode.Uri
    ): Promise<number> {
        // No version number in string: return -1
        if (!pattern.match(VariableResolver.VERSION_FORMAT)) return -1;

        // Replace the number placeholder with a regex number capture pattern
        // Regexp is case insensitive if OS is Windows
        const patternAsRegexp = new RegExp(
            escapeStringRegexp(path.basename(pattern)).replace(
                '\\$\\{#\\}',
                '([1-9][0-9]*)'
            ),
            this._isWindows ? 'i' : ''
        );

        // Get file directory
        const fileDir = path.isAbsolute(pattern)
            ? path.dirname(pattern) // Already absolute path
            : path.dirname(path.join(path.dirname(resource.fsPath), pattern)); // Get path of resource ('pattern' may contain a directory)

        // Make export directory if it doesn't exist
        if (!existsSync(fileDir)) mkdirSync(fileDir);

        // Read all files in directory
        const versionNum: number = await new Promise((resolve, reject) => {
            readdir(fileDir, (err, files) => {
                // Error; Return -2 (dir read error)
                if (err) {
                    if (DEBUG) console.error(err);
                    reject(-2); // File read error
                }

                // Get all the files that match the pattern (with different version numbers)
                const lastVersion = files.reduce(
                    (maxVer: number, file: string) => {
                        // Get pattern matches of file
                        const matched = patternAsRegexp.exec(file);
                        // If there's a match, return whichever version is greater
                        return matched
                            ? Math.max(maxVer, Number(matched[1]))
                            : maxVer;
                    },
                    0
                );

                // if (DEBUG) console.log(`Last version: ${lastVersion}`); // DEBUG

                resolve(lastVersion);
            });
        });

        // if (DEBUG) console.log(`Version num: ${versionNum}`);   // DEBUG

        if (versionNum < 0) return versionNum;
        // Error; return as-is
        else return versionNum + 1; // Return next version

        // Consider adding case for MAX_SAFE_NUMBER (despite it's unlikeliness)
    }

    public get defaultPattern(): string {
        return this._defaultPattern;
    }
}
