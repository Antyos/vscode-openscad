import * as vscode from 'vscode';
import { Cheatsheet } from './cheatsheet';

// declare module '*.html';
// import cshtml from '../SCAD_CheatSheet.html';

// Cheatsheet command
// let cheatsheet: Cheatsheet;
let docIsSCAD:vscode.DocumentSelector = {language: 'scad'};

// Called when extension is activated
// Extension is activated the first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Track current webview panel
    let currentPanel: vscode.WebviewPanel | undefined = undefined;

    // Register 'Open SCAD cheatsheet' command
    context.subscriptions.push(
        vscode.commands.registerCommand(Cheatsheet.csCommandId, () => Cheatsheet.createOrShowPanel())
    );
    
    // Create a new status bar item
    context.subscriptions.push(Cheatsheet.createStatusBar());

    // Register serializer event action to recreate webview panel if vscode restarts
    if (vscode.window.registerWebviewPanelSerializer)
    {
        // Make sure we register a serializer in action event
        vscode.window.registerWebviewPanelSerializer(Cheatsheet.viewType, {
            async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
                console.log(`Got state: ${state}`);
                Cheatsheet.revive(webviewPanel);
            }
        });
    }
    
    // Register listeners to make sure cheatsheet items are up-to-date
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(onDidChangeActiveTextEditor));
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(onDidChangeConfiguration));
    onDidChangeConfiguration();
    
    // Update status bar item once at start
    Cheatsheet.updateStatusBar();
}

// Called when extension is deactivated
export function deactivate() {};

// Run on active change text editor
function onDidChangeActiveTextEditor() {
    Cheatsheet.onDidChangeActiveTextEditor();
}

// Run when configuration is changed
function onDidChangeConfiguration() {
  const config = vscode.workspace.getConfiguration('openscad');   // Get new config  
  Cheatsheet.onDidChangeConfiguration(config);                    // Update the cheatsheet with new config
  // vscode.window.showInformationMessage("Config change!"); // Debug
}