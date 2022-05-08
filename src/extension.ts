/*---------------------------------------------------------------------------------------------
 * Extension
 *
 * Main file for activating extension
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { Cheatsheet } from './cheatsheet';
import { PreviewManager } from './previewManager';
import { DEBUG } from './config';
import * as path from 'path';
import {
    LanguageClient, LanguageClientOptions, ServerOptions, TransportKind
} from 'vscode-languageclient/node';

// New launch object
const previewManager = new PreviewManager();

let client: LanguageClient;

// Called when extension is activated
export function activate(context: vscode.ExtensionContext): void {
    console.log('Activating openscad extension');

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand(Cheatsheet.csCommandId, () =>
            Cheatsheet.createOrShowPanel(context.extensionPath)
        )
    );
    context.subscriptions.push(
        vscode.commands.registerCommand(
            'openscad.preview',
            (mainUri, allUris) => previewManager.openFile(mainUri, allUris)
        )
    );
    context.subscriptions.push(
        vscode.commands.registerCommand(
            'openscad.exportByType',
            (mainUri, allUris) => previewManager.exportFile(mainUri, allUris)
        )
    );
    context.subscriptions.push(
        vscode.commands.registerCommand(
            'openscad.exportByConfig',
            (mainUri, allUris) =>
                previewManager.exportFile(mainUri, allUris, 'auto')
        )
    );
    context.subscriptions.push(
        vscode.commands.registerCommand(
            'openscad.exportWithSaveDialogue',
            (mainUri, allUris) =>
                previewManager.exportFile(mainUri, allUris, 'auto', true)
        )
    );
    context.subscriptions.push(
        vscode.commands.registerCommand('openscad.kill', () =>
            previewManager.kill()
        )
    );
    context.subscriptions.push(
        vscode.commands.registerCommand('openscad.autoKill', () =>
            previewManager.kill(true)
        )
    );
    context.subscriptions.push(
        vscode.commands.registerCommand('openscad.killAll', () =>
            previewManager.killAll()
        )
    );

    // Register status bar item
    context.subscriptions.push(Cheatsheet.getStatusBarItem());

    // Register listeners to make sure cheatsheet items are up-to-date
    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(onDidChangeActiveTextEditor)
    );
    context.subscriptions.push(
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
                if (DEBUG) console.log(`Got state: ${state}`);
                Cheatsheet.revive(webviewPanel, context.extensionPath);
            },
        });
    }

    client = startLanguageClient(context);
}

// Called when extension is deactivated
export function deactivate(): Thenable<void> | undefined {
    if (client) {
        return client.stop();
    }
    return undefined;
}

// Run on active change text editor
function onDidChangeActiveTextEditor() {
    Cheatsheet.onDidChangeActiveTextEditor();
}

// Run when configuration is changed
function onDidChangeConfiguration() {
    const config = vscode.workspace.getConfiguration('openscad'); // Get new config
    Cheatsheet.onDidChangeConfiguration(config); // Update the cheatsheet with new config
    previewManager.onDidChangeConfiguration(config); // Update launcher with new config
    // vscode.window.showInformationMessage("Config change!"); // DEBUG
}

function startLanguageClient(context: vscode.ExtensionContext): LanguageClient {
    const serverModule = context.asAbsolutePath(path.join('out', 'language-server', 'main'));
    // The debug options for the server
    // --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging.
    // By setting `process.env.DEBUG_BREAK` to a truthy value, the language server will wait until a debugger is attached.
    const debugOptions = { execArgv: ['--nolazy', `--inspect${process.env.DEBUG_BREAK ? '-brk' : ''}=${process.env.DEBUG_SOCKET || '6009'}`] };

    // If the extension is launched in debug mode then the debug server options are used
    // Otherwise the run options are used
    const serverOptions: ServerOptions = {
        run: { module: serverModule, transport: TransportKind.ipc },
        debug: { module: serverModule, transport: TransportKind.ipc, options: debugOptions }
    };

    const fileSystemWatcher = vscode.workspace.createFileSystemWatcher('**/*.scad');
    context.subscriptions.push(fileSystemWatcher);

    // Options to control the language client
    const clientOptions: LanguageClientOptions = {
        documentSelector: [{ scheme: 'file', language: 'scad' }],
        synchronize: {
            // Notify the server about file changes to files contained in the workspace
            fileEvents: fileSystemWatcher
        }
    };

    // Create the language client and start the client.
    const client = new LanguageClient(
        'scad',
        'OpenSCAD',
        serverOptions,
        clientOptions
    );

    // Start the client. This will also launch the server
    console.log('Starting openscad language server and client');
    client.start();
    return client;
}
