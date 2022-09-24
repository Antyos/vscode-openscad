/**-----------------------------------------------------------------------------
 * Extension
 *
 * Main file for activating extension
 *----------------------------------------------------------------------------*/

import * as vscode from 'vscode';

import { Cheatsheet } from 'src/cheatsheet/cheatsheet-panel';
import { PreviewManager } from 'src/preview/preview-manager';

/** New launch object */
const previewManager = new PreviewManager();

/** Called when extension is activated */
export function activate(context: vscode.ExtensionContext): void {
    console.log('Activating openscad extension');

    // Register commands
    const commands = [
        vscode.commands.registerCommand(Cheatsheet.csCommandId, () =>
            Cheatsheet.createOrShowPanel(context.extensionUri)
        ),
        vscode.commands.registerCommand(
            'openscad.preview',
            (mainUri, allUris) => previewManager.openFile(mainUri, allUris)
        ),
        vscode.commands.registerCommand(
            'openscad.exportByType',
            (mainUri, allUris) => previewManager.exportFile(mainUri, allUris)
        ),
        vscode.commands.registerCommand(
            'openscad.exportByConfig',
            (mainUri, allUris) =>
                previewManager.exportFile(mainUri, allUris, 'auto')
        ),
        vscode.commands.registerCommand(
            'openscad.exportWithSaveDialogue',
            (mainUri, allUris) =>
                previewManager.exportFile(mainUri, allUris, 'auto', true)
        ),
        vscode.commands.registerCommand('openscad.kill', () =>
            previewManager.kill()
        ),
        vscode.commands.registerCommand('openscad.autoKill', () =>
            previewManager.kill(true)
        ),
        vscode.commands.registerCommand('openscad.killAll', () =>
            previewManager.killAll()
        ),
    ];

    // Register commands, event listeners, and status bar item
    context.subscriptions.push(
        ...commands,
        Cheatsheet.getStatusBarItem(),
        vscode.window.onDidChangeActiveTextEditor(onDidChangeActiveTextEditor),
        vscode.workspace.onDidChangeConfiguration(onDidChangeConfiguration)
    );
    onDidChangeConfiguration();

    // Update status bar item once at start
    Cheatsheet.updateStatusBar();

    // Register serializer event action to recreate webview panel if vscode restarts
    if (vscode.window.registerWebviewPanelSerializer) {
        // Make sure we register a serializer in action event
        vscode.window.registerWebviewPanelSerializer(Cheatsheet.viewType, {
            async deserializeWebviewPanel(
                webviewPanel: vscode.WebviewPanel,
                state: unknown
            ) {
                console.log(`Got state: ${state}`);
                Cheatsheet.revive(webviewPanel, context.extensionUri);
            },
        });
    }
}

/** Called when extension is deactivated */
// export function deactivate() {}

/** Run on active change text editor */
function onDidChangeActiveTextEditor() {
    Cheatsheet.onDidChangeActiveTextEditor();
}

/** Run when configuration is changed */
function onDidChangeConfiguration() {
    const config = vscode.workspace.getConfiguration('openscad'); // Get new config
    Cheatsheet.onDidChangeConfiguration(config); // Update the cheatsheet with new config
    previewManager.onDidChangeConfiguration(config); // Update launcher with new config
    // vscode.window.showInformationMessage("Config change!"); // DEBUG
}
