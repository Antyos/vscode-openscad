import * as vscode from 'vscode';

// Returns the filename from a given uri
export function uriFileName(uri: vscode.Uri): string | undefined {
    return ((uri.scheme === 'file') ? uri.path.substr(uri.path.lastIndexOf('/')+1) : undefined);
}

// Returns the filename from a given uri
export function uriFileNameNoExt(uri: vscode.Uri): string | undefined {
    const fileName = uriFileName(uri);
    return ((fileName !== undefined) ? fileName.substr(0,uri.path.lastIndexOf('.')) : undefined);
}