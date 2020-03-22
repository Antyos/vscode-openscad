import * as vscode from 'vscode';
import { ScadConfig } from './config';
import { Preview }  from './preview';
import { PreviewStore } from './previewStore';

// PreviewItems used for `scad.kill` quick pick menu
class PreviewItem implements vscode.QuickPickItem {

	label: string;      // File name
	description:string; // File path
    uri: vscode.Uri;    // Raw file uri
	
	constructor(public file: vscode.Uri) {
		this.label = file.path.replace(/\/.*\//g, '');  // Remove path before filename
        this.description = file.path.substring(1);      // Remove first '/'
        this.uri = file;
	}
}

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
        if (this.previewStore.size() >= this.previewStore.getMaxPreviews()) {
            console.error("Max number of preview windows already open."); 
            vscode.window.showErrorMessage("Max number of preview windows already open.");
            return;
        }
        
        if (this.previewStore.get(resource) !== undefined) {
            console.log("File already open");
            vscode.window.showInformationMessage("File already open");
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
        // Check that there are open previews
        if (this.previewStore.size() <= 0) {
            console.error("No open previews");
            vscode.window.showQuickPick(["No open previews."]);
            return;
        }

        const uris: vscode.Uri[] = this.previewStore.getUris();
        let picks: PreviewItem[] = [];
        uris.forEach(uri => picks.push(new PreviewItem(uri)));

        const selected = await vscode.window.showQuickPick(picks, {
            placeHolder: 'Select open preview to kill'
        });

        if (!selected) return;

        const previewToDelete = this.previewStore.get(selected.uri)
        if (!previewToDelete) return;

        this.previewStore.delete(previewToDelete, true);
        
        // vscode.window.showInformationMessage(`Killed: ${selected.label}`);
    }

    // Kill all the current previews
    public killAll() {
        // Check that there are open previews
        if (this.previewStore.size() <= 0) {
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
            Preview.setScadPath(this.config.openscadPath);
        }

        // Set the max previews
        this.previewStore.setMaxPreviews(this.config.maxInstances ? this.config.maxInstances : 0);
    }
}