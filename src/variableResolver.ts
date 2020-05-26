/*---------------------------------------------------------------------------------------------
 * Variable Resolver
 * 
 * Resolves variables in a string with respect to a workspace or file
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import * as path from 'path';

// Returns file name without extension
export function fileNameNoExt(uri: vscode.Uri) {
    return path.basename(uri.fsPath, path.extname(uri.fsPath))
}