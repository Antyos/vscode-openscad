/**-----------------------------------------------------------------------------
 * Web Extension
 *
 * Main file for activating extension on the web. The web extension only has
 * the Cheatsheet webview panel.
 *----------------------------------------------------------------------------*/

import * as vscode from 'vscode';

import { Cheatsheet } from 'src/cheatsheet/cheatsheet-panel';
import { LoggingService } from './logging-service';

const extensionName = process.env.EXTENSION_NAME || 'antyos.openscad';
const extensionVersion = process.env.EXTENSION_VERSION || '0.0.0';

/**
 * Register a command that is not supported in VS Code web.
 * The command will display an error message.
 *
 * Commands may be invalid for many reasons, but primarily due to the lack of
 * executable support for web extensions.
 */
function unsupportedWebCommand(commandId: string): vscode.Disposable {
    return vscode.commands.registerCommand(commandId, () =>
        vscode.window.showErrorMessage(
            `Command '${commandId}' is currently not supported in VS Code Web.`
        )
    );
}

/** Called when extension is activated */
export function activate(context: vscode.ExtensionContext): void {
    const loggingService = new LoggingService();

    loggingService.logInfo(`Activating ${extensionName} v${extensionVersion}`);
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration((event) => {
            if (event.affectsConfiguration('openscad.logLevel')) {
                loggingService.setOutputLevel(
                    vscode.workspace
                        .getConfiguration('openscad')
                        .get('logLevel') ?? 'NONE'
                );
            }
        })
    );

    // Register commands
    const commands = [
        vscode.commands.registerCommand(Cheatsheet.csCommandId, () =>
            Cheatsheet.createOrShowPanel(context.extensionUri)
        ),
        vscode.commands.registerCommand('openscad.showOutput', () => {
            loggingService.show();
        }),
        unsupportedWebCommand('openscad.preview'),
        unsupportedWebCommand('openscad.exportByType'),
        unsupportedWebCommand('openscad.exportByConfig'),
        unsupportedWebCommand('openscad.exportWithSaveDialogue'),
        unsupportedWebCommand('openscad.kill'),
        unsupportedWebCommand('openscad.autoKill'),
        unsupportedWebCommand('openscad.killAll'),
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
                loggingService.logInfo(`Got webview state: ${state}`);
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
    // vscode.window.showInformationMessage("Config change!"); // DEBUG
}
