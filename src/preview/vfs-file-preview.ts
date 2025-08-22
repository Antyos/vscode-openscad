import * as vscode from 'vscode';

export const vfsFilePreview = (file: string) => async (uri?: vscode.Uri) => {
    if (!uri) {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;
        uri = editor.document.uri;
    }
    const vfsUri = uri.with({ scheme: 'openscad-debug', path: uri.path + file });
    await vscode.commands.executeCommand('vscode.open', vfsUri);
};