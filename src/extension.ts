import * as vscode from 'vscode';
import { Cheatsheet } from './cheatsheet';
import { PreviewManager } from './previewManager';

// New launch object
const previewManager = new PreviewManager();

// Called when extension is activated
export function activate(context: vscode.ExtensionContext) {
    // Create 'Open SCAD cheatsheet' command
    const openCheatsheet = vscode.commands.registerCommand(Cheatsheet.csCommandId, () => Cheatsheet.createOrShowPanel(context.extensionPath));
    
    // Initialize cheatsheet status bar item
    Cheatsheet.initStatusBar();

    // Create preview commands
    const preview = vscode.commands.registerCommand(PreviewManager.commandId.preview, (mainUri, allUris) => previewManager.openFile(mainUri,allUris));
    const exportTo = vscode.commands.registerCommand('scad.export', (mainUri, allUris) => previewManager.exportFile(mainUri, allUris));
    const exportToStl = vscode.commands.registerCommand('scad.exportToStl', (mainUri, allUris) => previewManager.exportFile(mainUri, allUris, 'stl'));
    const kill = vscode.commands.registerCommand(PreviewManager.commandId.kill, () => previewManager.kill());
    const autoKill = vscode.commands.registerCommand('scad.autoKill', () => previewManager.kill(true));
    const killAll = vscode.commands.registerCommand(PreviewManager.commandId.killAll, () => previewManager.killAll());

    // Register commands
    context.subscriptions.push(openCheatsheet);
    context.subscriptions.push(Cheatsheet.csStatusBarItem);
    context.subscriptions.push(preview);
    context.subscriptions.push(exportTo);
    context.subscriptions.push(exportToStl);
    context.subscriptions.push(kill);
    context.subscriptions.push(autoKill);
    context.subscriptions.push(killAll);
    
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
                console.log(`Got state: ${state}`);
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