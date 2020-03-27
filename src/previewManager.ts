import * as vscode from 'vscode';
import * as path from 'path';
import { ScadConfig } from './config';
import { Preview }  from './preview';
import { PreviewStore } from './previewStore';
import { uriFileName, uriFileNameNoExt } from './utils';

// PreviewItems used for `scad.kill` quick pick menu
class PreviewItem implements vscode.QuickPickItem {

	label: string;          // File name
	description: string;    // File path
    uri: vscode.Uri;        // Raw file uri
	
	constructor(public file: vscode.Uri) {
        const fileName = uriFileName(file);
		this.label = fileName ? fileName : '';  // Remove path before filename
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

// Avaiable file extensions for export
export type TExportFileExt =  'stl'|'off'|'amf'|'3mf'|'csg'|'dxf'|'svg'|'png'|'echo'|'ast'|'term'|'nef3'|'nefdbg';
export const ExportFileExt = ['stl','off','amf','3mf','csg','dxf','svg','png','echo','ast','term','nef3','nefdbg'];

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
    public openFile(mainUri?: vscode.Uri, allUris?: vscode.Uri[], args?: string[]) {
        (Array.isArray(allUris) ? allUris : [mainUri]).forEach( async (uri) => {
            let resource: vscode.Uri;

            // console.log(`openFile: { main: ${mainUri}, all: ${allUris}, args: ${args}}`);   // DEBUG

            // If uri not given, try opening activeTextEditor
            if (!(uri instanceof vscode.Uri)) { 
                const newUri = await this.getActiveEditorUri();
                if (newUri) resource = newUri;
                else return;
            }
            // Uri is given, set `resource`
            else resource = uri;

            // Check if a new preview can be opened
            if (!this.canOpenNewPreview(resource)) return;
            
            console.log(`uri: ${resource}`);    // DEBUG

            // Create and add new OpenSCAD preview to PreviewStore
            this.previewStore.createAndAdd(resource, args);
        });
    }

    // Export file
    public exportFile(mainUri?: vscode.Uri, allUris?: vscode.Uri[], fileExt?: TExportFileExt) {
        (Array.isArray(allUris) ? allUris : [mainUri]).forEach( async (uri) => {
            let resource: vscode.Uri;
            let args: string[] = [];

            if (!fileExt) return;
            
            // If uri not given, try opening activeTextEditor
            if (!(uri instanceof vscode.Uri)) { 
                const newUri = await this.getActiveEditorUri();
                if (newUri) resource = newUri;
                else return;
            }
            // Uri is given, set `resource`
            else resource = uri;

            args.push('-o');
            args.push(`${path.dirname(resource.fsPath)}/${path.basename(resource.fsPath, path.extname(resource.fsPath))}.${fileExt}`);

            // Check if a new preview can be opened
            if (!this.canOpenNewPreview(resource)) return;
            
            console.log(`uri: ${resource}`); // DEBUG

            this.previewStore.createAndAdd(resource, args);
        });
    }

    // Prompt user for instances to kill
    public async kill(autoKill?: boolean) {
        // If autoKill (for menu button usage), don't display the menu for 0 or 1 open previews
        if (autoKill) {
            // No active previews: Inform user
            if (this.previewStore.size === 0) {
                vscode.window.showInformationMessage("No open previews.");
                return;
            } 
            // 1 active preview: delete it
            else if (this.previewStore.size === 1) {
                this.previewStore.deleteAll(this.config.showKillMessage);
                return;
            }
        }
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

        this.previewStore.delete(previewToDelete, this.config.showKillMessage);
    }

    // Kill all the current previews
    public killAll() {
        // Check that there are open previews
        if (this.previewStore.size <= 0) {
            console.error("No open previews");
            vscode.window.showInformationMessage("No open previews.");
            return;
        }

        this.previewStore.deleteAll(this.config.showKillMessage);
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
        this.config.showKillMessage = config.get<boolean>('showKillMessage');

        // Set the path in the preview
        if (this.config.openscadPath) {
            Preview.scadPath = this.config.openscadPath;
        }

        // Set the max previews
        this.previewStore.maxPreviews = (this.config.maxInstances ? this.config.maxInstances : 0);
    }

    // Gets the uri of the active editor
    private async getActiveEditorUri() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return undefined;

        // Make user save their document before previewing if it is untitled
        // TODO: Consider implementing as virtual (or just temp) document in the future
        if (editor.document.isUntitled) {
            vscode.window.showInformationMessage("Save untitled document before previewing");
            // Prompt save window
            const savedUri = await vscode.window.showSaveDialog({
                defaultUri: editor.document.uri,
                filters: {'OpenSCAD Designs': ['scad']}
            });
            // If user saved, set `resource` otherwise, return
            if (savedUri) return savedUri;
            else return undefined;
        } 
        // If document is already saved, set `resource`
        else return editor.document.uri;
    }

    private canOpenNewPreview(resource: vscode.Uri): boolean {
        // Make sure path to openscad.exe is valid
        if (!Preview.isValidScadPath) {
            console.error("Path to openscad.exe is invalid");   // DEBUG
            vscode.window.showErrorMessage("Path to openscad.exe is invalid.");
            return false;
        }

        // Make sure we don't surpass max previews allowed
        else if (this.previewStore.size >= this.previewStore.maxPreviews && this.previewStore.maxPreviews > 0) {
            console.error("Max number of OpenSCAD previews already open."); // DEBUG
            vscode.window.showErrorMessage("Max number of OpenSCAD previews already open.");
            return false;
        }
        
        // Make sure file is not already open
        else if (this.previewStore.get(resource) !== undefined) {
            console.log(`File is already open: "${resource.fsPath}"`);
            vscode.window.showInformationMessage(`${uriFileName(resource)} is already open: "${resource.fsPath}"`);
            return false;
        }

        else return true;
    }
}