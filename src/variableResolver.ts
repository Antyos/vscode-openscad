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
import { existsSync } from 'fs';
import { ScadConfig } from './config';

// Returns file name without extension
export function fileBasenameNoExt(uri: vscode.Uri): string {
    return path.basename(uri.fsPath, path.extname(uri.fsPath))
}

// Resolves variables in '${VAR_NAME}' format within a string
export class VariableResolver {
    // Regex patterns to identify variables
    private static readonly VARIABLE_REGEXP = /\$\{(.*?)\}/g;
    // private static readonly VARIABLE_REGEXP_SINGLE = /\$\{(.*?)\}/; // Unused
    private static readonly VERSION_FORMAT = /\${#}/g;

    private readonly defaultPattern = "${fileBasenameNoExtension}.${exportExtension}";   // Default naming pattern
    private _config: ScadConfig;

    constructor(config: ScadConfig) {
        this._config = config
    }

    // Resolve variables in string given a file URI
    public resolveString(pattern: string = this.defaultPattern, resource: vscode.Uri, exportExt?: string): string {
        // console.log(`resolveString pattern: ${pattern}`); // DEBUG

        // Replace all variable pattern matches '${VAR_NAME}'
        const replaced = pattern.replace(VariableResolver.VARIABLE_REGEXP, (match: string, variable: string) => {
            let resolvedValue = this.evaluateSingleVariable(match, variable, resource, exportExt);

            return resolvedValue;
        });

        // Get dynamic version number
        const version = this.getVersionNumber(replaced, resource)

        console.log(`Version number: ${version}`);

        // Cases for version number
        switch (version)
        {
            case -1:    // No version number
                return replaced;
            case -2:    // Reached max version number\
                // NOTE: Not a good way of doing this, but better algorithm should fix this
                vscode.window.showErrorMessage(`Reached max version number for '${replaced}' Try checking \`openscad.export.maxVersionNumber\` config setting.`)
                return replaced;
            default:    // Substitute version number
                return replaced.replace(VariableResolver.VERSION_FORMAT, String(version));
        }
    }

    // Evaluate a single variable in format '${VAR_NAME}'
    private evaluateSingleVariable(match: string, variable: string, resource: vscode.Uri, exportExt: string = "scad"): string {
        switch (variable) {
            case "fileBasenameNoExtension":
                return fileBasenameNoExt(resource);
            case "exportExtension":
                if (exportExt)  return exportExt;
            case "#":
            default:
                return match;
        }
    }

    // TODO: Improve algorithm
    // Evaluate version number in format '${#}'
    private getVersionNumber(pattern: string, resource: vscode.Uri): number {
        let version: number;
        let filePath: string;
        
        // No version number in string: return -1
        if (!pattern.match(VariableResolver.VERSION_FORMAT)) return -1;
        
        // Get full file path
        filePath = (path.isAbsolute(pattern) ? pattern : path.join(path.dirname(resource.fsPath), pattern));

        // Resolve dynamic version number
        for (version = 1; version <= (this._config.maxVersionNumber || 1000); version++) {
            // Substitute the version number. Return the version number if it doesn't already exist
            if (!existsSync(filePath.replace(VariableResolver.VERSION_FORMAT, String(version)))) 
                return version;
        }

        // Reached max version number, return -2
        return -2;
    }
}