/**-----------------------------------------------------------------------------
 * Cheatsheet
 *
 * Generates a webview panel containing the OpenSCAD cheatsheet
 *----------------------------------------------------------------------------*/

import * as vscode from 'vscode';

import { ScadConfig } from 'src/config';
import { CheatsheetContent } from './cheatsheet-content';

/**
 * OpenSCAD Cheatsheet webview and commands.
 *
 * Only one instance of cheatsheet panel is allowed, so most things are delcared
 * `static`.
 */
export class Cheatsheet {
    public static readonly csCommandId = 'openscad.cheatsheet'; // Command id for opening the cheatsheet
    public static readonly viewType = 'cheatsheet'; // Internal reference to cheatsheet panel

    public static currentPanel: Cheatsheet | undefined; // Webview Panel
    private static csStatusBarItem: vscode.StatusBarItem | undefined; // Cheatsheet status bar item

    private readonly _panel: vscode.WebviewPanel; // Webview panels
    private static config: ScadConfig = {}; // Extension config

    private cheatsheetContent: CheatsheetContent;
    private _disposables: vscode.Disposable[] = [];

    /** Create or show cheatsheet panel */
    public static createOrShowPanel(extensionPath: vscode.Uri): void {
        // Determine which column to show cheatsheet in
        // If not active editor, check config to open in current window to to the side
        const column = vscode.window.activeTextEditor
            ? Cheatsheet.config.openToSide === 'beside'
                ? vscode.ViewColumn.Beside
                : vscode.window.activeTextEditor.viewColumn
            : undefined;

        if (Cheatsheet.currentPanel) {
            // If we already have a panel, show it in the target column
            Cheatsheet.currentPanel._panel.reveal(column);
            return;
        }

        // Otherwise, create and show new panel
        const panel = vscode.window.createWebviewPanel(
            Cheatsheet.viewType, // Indentifies the type of webview. Used internally
            'OpenSCAD Cheat Sheet', // Title of panel displayed to the user
            column || vscode.ViewColumn.One, // Editor column
            {
                // Only allow webview to access certain directory
                localResourceRoots: [
                    vscode.Uri.joinPath(extensionPath, 'media', 'cheatsheet'),
                ],
                // Disable scripts
                // (defaults to false, but no harm in explcit declaration)
                enableScripts: false,
            } // Webview options
        );

        // Create new panel
        Cheatsheet.currentPanel = new Cheatsheet(panel, extensionPath);
    }

    /** Recreate panel in case vscode restarts */
    public static revive(
        panel: vscode.WebviewPanel,
        extensionPath: vscode.Uri
    ): void {
        Cheatsheet.currentPanel = new Cheatsheet(panel, extensionPath);
    }

    /** Create a new Cheatsheet */
    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._panel = panel;

        // Listen for when panel is disposed
        // This happens when user closes the panel or when the panel is closed progamatically
        this._panel.onDidDispose(
            () => this.dispose(),
            undefined,
            this._disposables
        );

        // Cheatsheet content
        this.cheatsheetContent = new CheatsheetContent(
            vscode.Uri.joinPath(extensionUri, 'media', 'cheatsheet'),
            this._panel.webview
        );

        // Set HTML content
        this.updateWebviewContent();
    }

    /** Dispose of panel and clean up resources */
    public dispose(): void {
        Cheatsheet.currentPanel = undefined;

        // Clean up resources
        this._panel.dispose();

        while (this._disposables.length > 0) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose;
            }
        }
    }

    /** Initializes the status bar (if not yet) and return the status bar */
    public static getStatusBarItem(): vscode.StatusBarItem {
        if (!Cheatsheet.csStatusBarItem) {
            Cheatsheet.csStatusBarItem = vscode.window.createStatusBarItem(
                vscode.StatusBarAlignment.Left
            );
            Cheatsheet.csStatusBarItem.command = Cheatsheet.csCommandId;
        }

        return Cheatsheet.csStatusBarItem;
    }

    /** Dispose of status bar */
    public static disposeStatusBar(): void {
        if (!Cheatsheet.csStatusBarItem) {
            return;
        }
        Cheatsheet.csStatusBarItem.dispose();
        // Cheatsheet.csStatusBarItem = null; // Typescript doesn't like this...
    }

    // Show or hide status bar item (OpenSCAD Cheatsheet)
    public static updateStatusBar(): void {
        let showCsStatusBarItem = false; // Show cheatsheet status bar item or not

        // Determine to show cheatsheet status bar icon based on extension config
        switch (Cheatsheet.config.displayInStatusBar) {
            case 'always':
                showCsStatusBarItem = true;
                break;
            case 'openDoc':
                showCsStatusBarItem = Cheatsheet.isAnyOpenDocumentScad();
                break;
            case 'activeDoc':
                // Check the languageId of the active text document
                if (vscode.window.activeTextEditor) {
                    showCsStatusBarItem = Cheatsheet.isDocumentScad(
                        vscode.window.activeTextEditor.document
                    );
                }
                break;
            case 'never':
                showCsStatusBarItem = false;
                break;
        }

        // Show or hide `Open Cheatsheet` button
        if (Cheatsheet.csStatusBarItem) {
            if (showCsStatusBarItem) {
                Cheatsheet.csStatusBarItem.text = 'Open Cheatsheet';
                Cheatsheet.csStatusBarItem.show();
            } else {
                Cheatsheet.csStatusBarItem.hide();
            }
        }
    }

    /** Run on change active text editor */
    public static onDidChangeActiveTextEditor(): void {
        // Update to the "Open Cheatsheet" status bar icon
        Cheatsheet.updateStatusBar();
    }

    /** Run when configurations are changed */
    public static onDidChangeConfiguration(
        config: vscode.WorkspaceConfiguration
    ): void {
        // Load the configuration changes
        Cheatsheet.config.displayInStatusBar = config.get<string>(
            'cheatsheet.displayInStatusBar',
            'openDoc'
        );
        Cheatsheet.config.colorScheme = config.get<string>(
            'cheatsheet.colorScheme',
            'auto'
        );
        Cheatsheet.config.openToSide = config.get<string>(
            'cheatsheet.openToSide',
            'beside'
        );

        // Update the status bar
        this.updateStatusBar();

        // Update css of webview (if config option has changed)
        if (
            Cheatsheet.currentPanel &&
            Cheatsheet.config.colorScheme !==
                Cheatsheet.currentPanel.cheatsheetContent.lastStyleKey
        ) {
            Cheatsheet.currentPanel.updateWebviewContent(); // Update webview html content
        }
    }

    /** Updates webview html content */
    public updateWebviewContent(): void {
        // If config.colorScheme isn't defined, use colorScheme 'auto'
        const colorScheme: string = Cheatsheet.config.colorScheme || 'auto';

        // Set webview content
        this.cheatsheetContent.getContent(colorScheme).then((content) => {
            this._panel.webview.html = content;
        });
    }

    //*****************************************************************************
    // Private Methods
    //*****************************************************************************

    /** True if there at least one open document of languageId `scad`? */
    private static isAnyOpenDocumentScad(): boolean {
        const openDocuments = vscode.workspace.textDocuments;
        let isScadDocumentOpen = false;

        // Iterate through open text documents
        for (const document of openDocuments) {
            if (this.isDocumentScad(document))
                // If document is of type 'scad' return true
                isScadDocumentOpen = true;
        }

        return isScadDocumentOpen;
    }

    /** True if a document languageId is `scad` */
    private static isDocumentScad(document: vscode.TextDocument): boolean {
        // vscode.window.showInformationMessage("Doc: " + doc.fileName + "\nLang id: " + langId); // DEBUG
        return document.languageId === 'scad';
    }
}
