import * as vscode from 'vscode';
import { DebugFileManager } from './debug-manager';

export const debugCommands = (debugManager?: DebugFileManager) =>async (targetUri?: vscode.Uri) => {
    if (!debugManager) {
        vscode.window.showErrorMessage('Open a workspace folder to enable writing debug files.');
        return;
    }
    const uriToUse = targetUri ?? vscode.window.activeTextEditor?.document.uri;
    if (!uriToUse) {
        vscode.window.showErrorMessage('No active OpenSCAD file selected to generate debug files for.');
        return;
    }
    await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: 'Writing OpenSCAD debug files...' }, async () => {
        try {
            await debugManager.updateAllDebugFiles(uriToUse);
            vscode.window.showInformationMessage('OpenSCAD debug files written.');
        } catch (err: any) {
            vscode.window.showErrorMessage(`Failed to write OpenSCAD debug files: ${err?.message ?? String(err)}`);
        }
    });
}
