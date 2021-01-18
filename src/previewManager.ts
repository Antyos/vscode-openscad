/*---------------------------------------------------------------------------------------------
 * Preview Manager
 *
 * Class for adding / removing OpenSCAD previews to a previewStore
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import * as path from 'path';
import { ScadConfig, DEBUG } from './config';
import { Preview } from './preview';
import { PreviewStore } from './previewStore';
import {
    TExportFileExt,
    ExportFileExt,
    ExportExtForSave,
} from './exportFileExt';
import { VariableResolver } from './variableResolver';

// PreviewItems used for `scad.kill` quick pick menu
class PreviewItem implements vscode.QuickPickItem {
    label: string; // File name
    description: string; // File path
    uri: vscode.Uri; // Raw file uri

    constructor(public preview: Preview) {
        const fileName = path.basename(preview.uri.fsPath);
        this.label =
            (preview.previewType === 'output' ? 'Exporting: ' : '') +
            (fileName ? fileName : ''); // Remove path before filename
        this.description = preview.uri.path.substring(1); // Remove first '/'
        this.uri = preview.uri;
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
    private previewStore = new PreviewStore();
    private config: ScadConfig = {};
    private variableResolver = new VariableResolver();

    // public activate() {}

    // Opens file in OpenSCAD
    public openFile(
        mainUri?: vscode.Uri,
        allUris?: vscode.Uri[],
        args?: string[]
    ): void {
        (Array.isArray(allUris) ? allUris : [mainUri]).forEach(async (uri) => {
            let resource: vscode.Uri;

            // if (DEBUG) console.log(`openFile: { main: ${mainUri}, all: ${allUris}, args: ${args}}`);   // DEBUG

            // If uri not given, try opening activeTextEditor
            if (!(uri instanceof vscode.Uri)) {
                const newUri = await this.getActiveEditorUri();
                if (newUri) resource = newUri;
                else return;
            }
            // Uri is given, set `resource`
            else resource = uri;

            // Check if a new preview can be opened
            if (!this.canOpenNewPreview(resource, args)) return;

            if (DEBUG) console.log(`uri: ${resource}`); // DEBUG

            // Create and add new OpenSCAD preview to PreviewStore
            this.previewStore.createAndAdd(resource, args);
        });
    }

    // Export file
    public async exportFile(
        mainUri?: vscode.Uri,
        allUris?: vscode.Uri[],
        fileExt?: TExportFileExt | 'auto',
        useSaveDialogue = false
    ): Promise<void> {
        let exportExt: TExportFileExt; // File extension for export

        // If file extension is not provided, prompt user
        if (
            !fileExt ||
            (fileExt === 'auto' &&
                this.config.preferredExportFileExtension === 'none')
        ) {
            // Show quick pick menu to prompt user for file extension
            const pick = await vscode.window.showQuickPick(ExportFileExt, {
                placeHolder: 'Select file extension for export',
            });

            if (pick) exportExt = <TExportFileExt>pick;
            // If user selected a file, cast and set exportExt
            else return; // Still no file extension, return
        }
        // Get file extension from config
        else if (fileExt === 'auto') {
            exportExt = <TExportFileExt>(
                this.config.preferredExportFileExtension
            );
        }
        // File extension is provided
        else exportExt = fileExt;

        // Iterate through uris
        (Array.isArray(allUris) ? allUris : [mainUri]).forEach(async (uri) => {
            let resource: vscode.Uri;
            let filePath: string;
            const args: string[] = [];

            // If uri not given, try opening activeTextEditor
            if (!(uri instanceof vscode.Uri)) {
                const newUri = await this.getActiveEditorUri();
                if (newUri) resource = newUri;
                else return;
            }
            // Uri is given, set `resource`
            else resource = uri;

            // Open save dialogue
            if (useSaveDialogue || !this.config.useAutoNamingExport) {
                // Pattern for URI used in save dialogue
                const pattern = this.config.useAutoNamingInSaveDialogues
                    ? this.config.autoNamingFormat
                    : this.variableResolver.defaultPattern;
                // Get Uri from save dialogue prompt
                const newUri = await this.promptForExport(
                    resource,
                    exportExt,
                    pattern
                );

                // If valid, set filePath. Otherwise, return
                if (newUri) filePath = newUri.fsPath;
                else return;
            }
            // Use config for auto generation of filename
            else {
                // Filename for export
                const fileName = await this.variableResolver.resolveString(
                    this.config.autoNamingFormat,
                    resource,
                    exportExt
                );
                // Set full file path; Make sure fileName is not already an absolute path
                filePath = path.isAbsolute(fileName)
                    ? fileName
                    : path.join(path.dirname(resource.fsPath), fileName);
            }

            // this.variableResolver.testVars(resource);   // TESTING / DEBUG

            // Set arguments
            args.push('-o'); // Set for output / export
            args.push(filePath); // Filename for export

            // Check if a new preview can be opened
            if (!this.canOpenNewPreview(resource, args)) return;

            if (DEBUG) console.log(`uri: ${resource}`); // DEBUG

            this.previewStore.createAndAdd(resource, args);
        });
    }

    // Prompt user for instances to kill
    public async kill(autoKill?: boolean): Promise<void> {
        // If autoKill (for menu button usage), don't display the menu for 0 or 1 open previews
        if (autoKill) {
            // No active previews: Inform user
            if (this.previewStore.size === 0) {
                vscode.window.showInformationMessage('No open previews.');
                return;
            }
            // 1 active preview: delete it
            else if (this.previewStore.size === 1) {
                this.previewStore.deleteAll(this.config.showKillMessage);
                return;
            }
        }
        // Create list for menu items
        const menuItems: (PreviewItem | MessageItem)[] = [];
        menuItems.push(this.previewStore.size > 0 ? mKillAll : mNoPreviews); // Push MessageItem depending on num open previews

        for (const preview of this.previewStore) {
            menuItems.push(new PreviewItem(preview));
        } // Populate quickpick list with open previews

        // Get from user
        const selected = await vscode.window.showQuickPick(menuItems, {
            placeHolder: 'Select open preview to kill',
        });

        if (!selected) return; // Return if selected is undefined

        // Check for message item
        if (selected instanceof MessageItem) {
            switch (selected) {
                case mKillAll:
                    this.killAll();
                    break;
                default:
                    break;
            }
            return;
        }

        // Get preview to delete
        const previewToDelete = this.previewStore.get(selected.uri);
        if (!previewToDelete) return;

        this.previewStore.delete(previewToDelete, this.config.showKillMessage);
    }

    // Kill all the current previews
    public killAll(): void {
        // Check that there are open previews
        if (this.previewStore.size <= 0) {
            if (DEBUG) console.error('No open previews');
            vscode.window.showInformationMessage('No open previews.');
            return;
        }

        this.previewStore.deleteAll(this.config.showKillMessage);
        // this._previews = undefined;
    }

    // Constructor
    public constructor() {
        // Load configutation
        this.onDidChangeConfiguration(
            vscode.workspace.getConfiguration('openscad')
        );
    }

    // Run when change configuration event
    public onDidChangeConfiguration(
        config: vscode.WorkspaceConfiguration
    ): void {
        // Update configuration
        this.config.openscadPath = config.get<string>('launchPath');
        this.config.maxInstances = config.get<number>('maxInstances');
        this.config.showKillMessage = config.get<boolean>('showKillMessage');
        this.config.preferredExportFileExtension = config.get<string>(
            'export.preferredExportFileExtension'
        );
        this.config.autoNamingFormat = config.get<string>(
            'export.autoNamingFormat'
        );
        this.config.useAutoNamingExport = config.get<boolean>(
            'export.useAutoNamingExport'
        );
        this.config.useAutoNamingInSaveDialogues = config.get<boolean>(
            'export.useAutoNamingInSaveDialogues'
        );

        // Only update openscad path if the path value changes
        if (this.config.lastOpenscadPath !== this.config.openscadPath) {
            this.config.lastOpenscadPath = this.config.openscadPath; // Set last path
            Preview.setScadPath(this.config.openscadPath); // Update path
        }

        // Set the max previews
        this.previewStore.maxPreviews = this.config.maxInstances
            ? this.config.maxInstances
            : 0;
    }

    // Gets the uri of the active editor
    private async getActiveEditorUri(): Promise<vscode.Uri | undefined> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return undefined;

        // Make user save their document before previewing if it is untitled
        // TODO: Consider implementing as virtual (or just temp) document in the future
        if (editor.document.isUntitled) {
            vscode.window.showInformationMessage(
                'Save untitled document before previewing'
            );
            // Prompt save window
            const savedUri = await vscode.window.showSaveDialog({
                defaultUri: editor.document.uri,
                filters: { 'OpenSCAD Designs': ['scad'] },
            });
            // If user saved, set `resource` otherwise, return
            if (savedUri) return savedUri;
            else return undefined;
        }
        // If document is already saved, set `resource`
        else return editor.document.uri;
    }

    // Prompts user for export name and location
    private async promptForExport(
        resource: vscode.Uri,
        exportExt: TExportFileExt = 'stl',
        pattern: string = this.variableResolver.defaultPattern
    ): Promise<vscode.Uri | undefined> {
        // Replace the `.scad` file extrension with the preferred type (or default to stl)
        const fileName = await this.variableResolver.resolveString(
            pattern,
            resource,
            exportExt
        ); // Filename for export
        const filePath = path.isAbsolute(fileName)
            ? fileName
            : path.join(path.dirname(resource.fsPath), fileName); // Full file path
        const resourceNewExt = vscode.Uri.file(filePath); // Resource URI with new file extension

        if (DEBUG) {
            console.log(`Opening Save Dialogue to: ${filePath}`);
        }

        // Open save dialogue
        const savedUri = await vscode.window.showSaveDialog({
            defaultUri: resourceNewExt,
            filters: ExportExtForSave,
        });

        // Return Uri
        return savedUri;
    }

    // Returns if the current URI with arguments (output Y/N) can be opened
    private canOpenNewPreview(resource: vscode.Uri, args?: string[]): boolean {
        // Make sure path to openscad.exe is valid
        if (!Preview.isValidScadPath) {
            if (DEBUG)
                console.error(
                    `Path to openscad command is invalid: "${Preview.scadPath}"`
                ); // DEBUG
            vscode.window.showErrorMessage(
                `Cannot find the command: "${Preview.scadPath}". Make sure OpenSCAD is installed. You may need to specify the installation path under \`Settings > OpenSCAD > Launch Path\``
            );
            return false;
        }

        // Make sure we don't surpass max previews allowed
        if (
            this.previewStore.size >= this.previewStore.maxPreviews &&
            this.previewStore.maxPreviews > 0
        ) {
            if (DEBUG)
                console.error('Max number of OpenSCAD previews already open.'); // DEBUG
            vscode.window.showErrorMessage(
                'Max number of OpenSCAD previews already open. Try increasing the max instances in the config.'
            );
            return false;
        }

        // Make sure file is not already open
        else if (
            this.previewStore.get(
                resource,
                PreviewStore.getPreviewType(args)
            ) !== undefined
        ) {
            if (DEBUG)
                console.log(`File is already open: "${resource.fsPath}"`);
            vscode.window.showInformationMessage(
                `${path.basename(resource.fsPath)} is already open: "${
                    resource.fsPath
                }"`
            );
            return false;
        } else return true;
    }
}
