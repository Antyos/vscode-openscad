import * as vscode from 'vscode';
import { ScadConfig } from './config';
import { Preview }  from './preview';
import { PreviewStore } from './previewStore';

// PreviewItems used for `scad.kill` quick pick menu
class PreviewItem implements vscode.QuickPickItem {

	label: string;          // File name
	description: string;    // File path
    uri: vscode.Uri;        // Raw file uri
	
	constructor(public file: vscode.Uri) {
		this.label = file.path.replace(/\/.*\//g, '');  // Remove path before filename
        this.description = file.path.substring(1);      // Remove first '/'
        this.uri = file;
	}
}

class MessageItem implements vscode.QuickPickItem {

    label: string;
    
    constructor(public message: string) {
        this.label = message;
    }
}

const mKillAll = new MessageItem('Kill All');
const mNoPreviews = new MessageItem('No open previews');

// Launcher class to handle launching instance of scad 
export class PreviewManager {
    // Command IDs
    public static readonly commandId = {
        preview: 'scad.preview',
        killAll: 'scad.killAll',
        kill: 'scad.kill'
    }

    private previewStore = new PreviewStore();
    private config: ScadConfig = {};

    // public activate() {}

    // Opens file in OpenSCAD
    public openFile(resource: vscode.Uri, args?: string[] | undefined) {
        // Error checking
        if (!Preview.isValidScadPath) {
            console.error("Path to openscad.exe is invalid");
            vscode.window.showErrorMessage("Failed to open preview: Path to openscad.exe is invalid.");
            return;
        }

        if (this.previewStore.size >= this.previewStore.maxPreviews || this.previewStore.maxPreviews === 0) {
            console.error("Max number of preview windows already open."); 
            vscode.window.showErrorMessage("Failed to open preview: Max number of preview windows already open.");
            return;
        }
        
        if (this.previewStore.get(resource) !== undefined) {
            console.log("File is already open");
            vscode.window.showInformationMessage("File is already open.");
            return;
        }

        const newPreview = Preview.create(resource, args);

        if (newPreview !== undefined) {
            this.previewStore.add(newPreview);
        }  
    }

    // Open current file
    public async openCurrentFile() {
        const editor = vscode.window.activeTextEditor;
        // Error checking
        if (!editor) { 
            console.error("No active text editor");
            vscode.window.showErrorMessage("No active text editor");
            return; 
        }

        // Make user save their document before previewing if it is untitled
        if (editor.document.isUntitled) {
            vscode.window.showInformationMessage("Save untitled document before previewing");
            await vscode.window.showSaveDialog({
                defaultUri: editor.document.uri,
                filters: {'OpenSCAD Designs': ['scad']}
            });
        }

        this.openFile(editor.document.uri);
    }

    // Prompt user for instances to kill
    public async kill() {
        // Create list for menu items
        let menuItems: (PreviewItem | MessageItem)[] = [];
        menuItems.push(this.previewStore.size > 0 ? mKillAll : mNoPreviews);    // Push MessageItem depending on num open previews

        const uris: vscode.Uri[] = this.previewStore.getUris(); // Get list of uris in PreviewStore
        uris.forEach(uri => menuItems.push(new PreviewItem(uri)));  // Populate quickpick list with open previews

        // Get from user
        const selected = await vscode.window.showQuickPick(menuItems, {
            placeHolder: 'Select open preview to kill'
        });

        if (!selected) return;  // Return if selected is undefined

        // Check for message item
        if (selected instanceof MessageItem) {
            switch (selected) {
                case (mKillAll):
                    this.killAll();
                    break;
                default:
                    break;
            }
            return;
        }

        // Get preview to delete
        const previewToDelete = this.previewStore.get(selected.uri)
        if (!previewToDelete) return;

        this.previewStore.delete(previewToDelete, true);
    }

    // Kill all the current previews
    public killAll() {
        // Check that there are open previews
        if (this.previewStore.size <= 0) {
            console.error("No open previews");
            vscode.window.showErrorMessage("No open previews.");
            return;
        }

        this.previewStore.deleteAll(true);
        // this._previews = undefined;
    }

    // Constructor
    public constructor() {
        // Load configutation
        this.onDidChangeConfiguration(vscode.workspace.getConfiguration('openscad')); 
    }

    // Run when change configuration event
    public onDidChangeConfiguration(config: vscode.WorkspaceConfiguration) {
        // Update configuration
        this.config.openscadPath = config.get<string>('launchPath');
        this.config.maxInstances = config.get<number>('maxInstances');

        // Set the path in the preview
        if (this.config.openscadPath) {
            Preview.scadPath = this.config.openscadPath;
        }

        // Set the max previews
        this.previewStore.maxPreviews = (this.config.maxInstances ? this.config.maxInstances : 0);
    }
}