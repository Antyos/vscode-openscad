/*---------------------------------------------------------------------------------------------
 * Extension
 * 
 * Main file for activating extension
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { Cheatsheet } from './cheatsheet';
import { PreviewManager } from './previewManager';
import { DEBUG } from './config';

// New launch object
const previewManager = new PreviewManager();

// Called when extension is activated
export function activate(context: vscode.ExtensionContext) {
    console.log("Activating openscad extension");

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand(Cheatsheet.csCommandId, () => Cheatsheet.createOrShowPanel(context.extensionPath))
    );
    context.subscriptions.push(
        vscode.commands.registerCommand('openscad.preview', (mainUri, allUris) => previewManager.openFile(mainUri,allUris))
    );
    context.subscriptions.push(
        vscode.commands.registerCommand('openscad.exportByType', (mainUri, allUris) => previewManager.exportFile(mainUri, allUris))
    );
    context.subscriptions.push(
        vscode.commands.registerCommand('openscad.exportByConfig', (mainUri, allUris) => previewManager.exportFile(mainUri, allUris, 'auto'))
    );
    context.subscriptions.push(
        vscode.commands.registerCommand('openscad.exportWithSaveDialogue', (mainUri, allUris) => previewManager.exportFile(mainUri, allUris, 'auto', true))
    );
    context.subscriptions.push(
        vscode.commands.registerCommand('openscad.kill', () => previewManager.kill())
    );
    context.subscriptions.push(
        vscode.commands.registerCommand('openscad.autoKill', () => previewManager.kill(true))
    );
    context.subscriptions.push(
        vscode.commands.registerCommand('openscad.killAll', () => previewManager.killAll())
    );
    
    // Register status bar item
    context.subscriptions.push(
        Cheatsheet.getStatusBarItem()
    );

    // Register listeners to make sure cheatsheet items are up-to-date
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(onDidChangeActiveTextEditor));
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(onDidChangeConfiguration));
    onDidChangeConfiguration();

    // Update status bar item once at start
    Cheatsheet.updateStatusBar();

    // Register serializer event action to recreate webview panel if vscode restarts
    if (vscode.window.registerWebviewPanelSerializer) {
        // Make sure we register a serializer in action event
        vscode.window.registerWebviewPanelSerializer(Cheatsheet.viewType, {
            async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
                if (DEBUG) console.log(`Got state: ${state}`);
                Cheatsheet.revive(webviewPanel, context.extensionPath);
            }
        });
    }
}

// Called when extension is deactivated
export function deactivate() {};

// Run on active change text editor
function onDidChangeActiveTextEditor() {
    Cheatsheet.onDidChangeActiveTextEditor();
}

// Run when configuration is changed
function onDidChangeConfiguration() {
  const config = vscode.workspace.getConfiguration('openscad'); // Get new config  
  Cheatsheet.onDidChangeConfiguration(config);                  // Update the cheatsheet with new config
  previewManager.onDidChangeConfiguration(config);              // Update launcher with new config
  // vscode.window.showInformationMessage("Config change!"); // DEBUG
}