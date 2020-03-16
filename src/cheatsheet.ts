import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

// Cheatsheet color schemes. Located in [extensionPath]/media/
const colorScheme = {
    'original': 'cheatsheet-original.css',
    'auto': 'cheatsheet-auto.css'
}

// Cheatsheet config values
export interface CheatsheetConfig
{
    displayInStatusBar?: string;
    colorScheme?: string;
    openToSide?: boolean;
}

// Class for Cheatsheet webview and commands
// Only one instance of cheatsheet panel so basically everything is delcared `static`
export class Cheatsheet
{
    public static readonly csCommandId = 'scad.cheatsheet';     // Command id for opening the cheatsheet
    public static readonly viewType = 'cheatsheet';             // Internal reference to cheatsheet panel

    public static currentPanel: Cheatsheet | undefined;         // Webview Panel
    public static csStatusBarItem: vscode.StatusBarItem;        // Cheatsheet status bar item 

    private readonly _panel: vscode.WebviewPanel;               // Webview panels
    private readonly _extensionPath: string;                    // Extension path
    private static config: CheatsheetConfig = {};               // Extension config
    private static isScadDocument: boolean;                     // Is current document openSCAD
    private static lastColorScheme: string;                     // HTML content for webview read directly from file

    
    private _disposables: vscode.Disposable[] = [];
    
    // Create or show cheatsheet panel
    public static createOrShowPanel(extensionPath: string) {
        // Determine which column to show cheatsheet in
        // If not active editor, check config to open in current window to to the side
        let column = vscode.window.activeTextEditor
            ? (Cheatsheet.config.openToSide ? vscode.ViewColumn.Beside : vscode.window.activeTextEditor.viewColumn)
            : undefined;


        if (Cheatsheet.currentPanel) 
        {
            // If we already have a panel, show it in the target column
            Cheatsheet.currentPanel._panel.reveal(column);
            return;
        } 
        
        // Otherwise, create and show new panel
        const panel = vscode.window.createWebviewPanel(
            Cheatsheet.viewType,                            // Indentifies the type of webview. Used internally
            'OpenSCAD Cheat Sheet',                         // Title of panel displayed to the user
            column || vscode.ViewColumn.One,        // Editor column
            {
                // Only allow webview to access certain directory
                localResourceRoots: [ vscode.Uri.file(path.join(extensionPath, 'media')) ]
            }   // Webview options
        );

        // Create new panel
        Cheatsheet.currentPanel = new Cheatsheet(panel, extensionPath);

    }

    // Recreate panel in case vscode restarts
    public static revive(panel: vscode.WebviewPanel, extensionPath: string) {
        Cheatsheet.currentPanel = new Cheatsheet(panel, extensionPath);
    }

    // Constructor
    private constructor(panel: vscode.WebviewPanel, extensionPath: string) {
        this._panel = panel;
        this._extensionPath = extensionPath;

        // Listen for when panel is disposed
        // This happens when user closes the panel or when the panel is closed progamatically
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        // Set HTML content
        this._panel.webview.html = this.getWebviewContent(colorScheme['auto']);

        // Notes for how to get html from file        
        // const onDiskPath = vscode.Uri.file(
        //     path.join(context.extensionPath, 'cheat-sheet', 'OpenSCAD CheatSheet.html')
        // );

        // currentPanel.webview.asWebviewUri(onDiskPath);

    }

    // Dispose of panel and clean up resources
    public dispose() {
        Cheatsheet.currentPanel = undefined;

        // Clean up resources
        this._panel.dispose();

        while (this._disposables.length)
        {
            const x = this._disposables.pop();
            if (x)
            {
                x.dispose;
            }
        }
    }

    // Initializes the status bar
    public static createStatusBar() {
        Cheatsheet.csStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
        Cheatsheet.csStatusBarItem.command = Cheatsheet.csCommandId;

        return Cheatsheet.csStatusBarItem;     
    }

    // Show or hide status bar item (OpenSCAD Cheatsheet)
    public static updateStatusBar() {
        let showCsStatusBarItem: boolean = false;   // Show cheatsheet status bar item or not

        // Determine to show cheatsheet status bar icon based on extension config
        switch(Cheatsheet.config.displayInStatusBar) {
            case 'always':
                showCsStatusBarItem = true;
                break;
            case 'openDoc':
                showCsStatusBarItem = Cheatsheet.isScadDocOpen();
                break;
            case 'activeDoc':
                showCsStatusBarItem = Cheatsheet.isScadDocument;
                break;
            case 'never':
                showCsStatusBarItem = false;
                break;
        }

        // Show or hide `Open Cheatsheet` button 
        if (showCsStatusBarItem)
        {
            Cheatsheet.csStatusBarItem.text = 'Open Cheatsheet';
            Cheatsheet.csStatusBarItem.show();
        }
        else
        {
            Cheatsheet.csStatusBarItem.hide();
        }
    }

    // Run on change active text editor
    public static onDidChangeActiveTextEditor() {
        // Determine the languageId of the active text document
        if (vscode.window.activeTextEditor) {
            Cheatsheet.isScadDocument = Cheatsheet.isDocScad(vscode.window.activeTextEditor.document);
        }
        else {
            Cheatsheet.isScadDocument = false;
        }
        
        // Set if the document type is SCAD based on the language id
        // Or current current document is the cheatsheet (for visual consistency)
        // Show if SCAD document is open (doesn't have to be active) or there is one in the working directory
        Cheatsheet.updateStatusBar();
    }

    // Run when configurations are changed
    public static onDidChangeConfiguration(config: vscode.WorkspaceConfiguration) {
        // Load the configuration changes
        Cheatsheet.config.displayInStatusBar = config.get<string>('cheatsheet.displayInStatusBar', 'openDoc');
        Cheatsheet.config.colorScheme = config.get<string>('cheatsheet.colorScheme', 'auto');
        Cheatsheet.config.openToSide = config.get<boolean>('cheatsheet.openToSide', true);

        // Update the status bar
        Cheatsheet.updateStatusBar();

        // Update css of webview (if config option has changed)
        // TODO: Make work
        // if (this.lastColorScheme !== Cheatsheet.config.colorScheme)
        // {
        //     this.lastColorScheme = Cheatsheet.config.colorScheme;
        //     Cheatsheet.currentPanel._panel.html = Cheatsheet.getWebviewContent('');
        // }

    }

    //*****************************************************************************
    // Private Methods
    //*****************************************************************************

    // Returns true if there is at least one open document of languageId 'scad'
    private static isScadDocOpen() {
        const openDocs = vscode.workspace.textDocuments;
        let isScadDocOpen: boolean = false;

        // Iterate through open text documents
        openDocs.forEach( (doc) => {
            if (this.isDocScad(doc)) // If document is of type 'scad' return true
                isScadDocOpen = true;
        } );

        return isScadDocOpen;
    }

    // Returns true is current document is of type 'scad'
    private static isDocScad(doc: vscode.TextDocument)
    {
        let langId = doc.languageId;
        // vscode.window.showInformationMessage("Doc: " + doc.fileName + "\nLang id: " + langId); // DEBUG
        return langId === 'scad'
    }

    // Returns cheatsheet html for webview
    private getWebviewContent(styleSrc: string)
    {
        // Read HTML from file
        let htmlContent = fs.readFileSync(path.join(this._extensionPath, 'media', 'cheatsheet.html')).toString();//,  
        // Get style sheet URI
        let styleUri = vscode.Uri.file(path.join(this._extensionPath, 'media', colorScheme.auto)).with({ scheme: 'vscode-resource' });

        htmlContent = htmlContent.replace('{{styleSrc}}', styleUri.toString());
        // Leftover from when using async. Left in because it is probably a good idea to implement again
        //     (err, data) => {
        //         if (err) {
        //             console.error(err);
        //         }
        //         console.log("Data:\n" + data.toString());
        //         myHtml = data.toString();
        //     }
        // )
        // console.log("myHtml:\n" + myHtml);   // DEBUG
        return htmlContent;
    }

}