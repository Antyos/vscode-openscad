/**-----------------------------------------------------------------------------
 * Preview Manager
 *
 * Class for adding / removing OpenSCAD previews to a previewStore
 *----------------------------------------------------------------------------*/

import * as path from 'path'; // node:path
import * as vscode from 'vscode';

import { ScadConfig } from 'src/config';
import {
    ExportExtensionsForSave,
    ExportFileExtension,
    ExportFileExtensionList,
} from 'src/export/export-file-extensions';
import { VariableResolver } from 'src/export/variable-resolver';
import { LoggingService } from 'src/logging-service';
import {
    OpenscadExecutable,
    OpenscadExecutableManager,
} from 'src/preview/openscad-exe';
import { Preview } from 'src/preview/preview';
import { PreviewStore } from 'src/preview/preview-store';

/** PreviewItems used for `scad.kill` quick pick menu */
class PreviewItem implements vscode.QuickPickItem {
    label: string; // File name
    description: string; // File path
    uri: vscode.Uri; // Raw file uri

    constructor(public preview: Preview) {
        const fileName = path.basename(preview.uri.fsPath);
        this.label = (preview.hasGui ? '' : 'Exporting: ') + fileName; // Remove path before filename
        this.description = preview.uri.path.slice(1); // Remove first '/'
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

/** Manager of multiple Preview objects */
export class PreviewManager {
    private previewStore: PreviewStore;
    private config: ScadConfig = {};
    private variableResolver: VariableResolver;
    private openscadExecutableManager: OpenscadExecutableManager;

    // public activate() {}

    /** Opens file in OpenSCAD */
    public async openFile(
        mainUri?: vscode.Uri,
        allUris?: vscode.Uri[],
        arguments_?: string[]
    ): Promise<void> {
        for (const uri of Array.isArray(allUris) ? allUris : [mainUri]) {
            let resource: vscode.Uri;

            this.loggingService.logDebug(
                `openFile: { main: ${mainUri}, all: ${allUris}, args: ${arguments_}}`
            ); // DEBUG

            // If uri not given, try opening activeTextEditor
            if (!(uri instanceof vscode.Uri)) {
                const newUri = await this.getActiveEditorUri();
                if (newUri) {
                    resource = newUri;
                } else {
                    return;
                }
            } else {
                resource = uri;
            }

            // Check if a new preview can be opened
            if (
                !this.canOpenNewPreview(
                    this.openscadExecutableManager.executable,
                    resource,
                    arguments_
                )
            ) {
                return;
            }

            this.loggingService.logDebug(`uri: ${resource}`); // DEBUG

            // Create and add new OpenSCAD preview to PreviewStore
            this.previewStore.createAndAdd(
                this.openscadExecutableManager.executable,
                resource,
                arguments_
            );
        }
    }

    /** Export file */
    public async exportFile(
        mainUri?: vscode.Uri,
        allUris?: vscode.Uri[],
        fileExtension?: ExportFileExtension | 'auto',
        useSaveDialogue = false
    ): Promise<void> {
        let exportExtension: ExportFileExtension; // File extension for export

        // If file extension is not provided, prompt user
        if (
            !fileExtension ||
            (fileExtension === 'auto' &&
                this.config.preferredExportFileExtension === 'none')
        ) {
            // Show quick pick menu to prompt user for file extension
            const pick = await vscode.window.showQuickPick(
                ExportFileExtensionList,
                {
                    placeHolder: 'Select file extension for export',
                }
            );

            if (pick) {
                exportExtension = <ExportFileExtension>pick;
            } else {
                return;
            } // Still no file extension, return
        }
        // Get file extension from config
        else if (fileExtension === 'auto') {
            exportExtension = <ExportFileExtension>(
                this.config.preferredExportFileExtension
            );
        } else {
            exportExtension = fileExtension;
        }

        // Iterate through uris
        for (const uri of Array.isArray(allUris) ? allUris : [mainUri]) {
            let resource: vscode.Uri;
            let filePath: string;
            const arguments_: string[] = [];

            // If uri not given, try opening activeTextEditor
            if (!(uri instanceof vscode.Uri)) {
                const newUri = await this.getActiveEditorUri();
                if (newUri) {
                    resource = newUri;
                } else {
                    return;
                }
            } else {
                resource = uri;
            }

            // Open save dialogue
            if (useSaveDialogue || !this.config.useAutoNamingExport) {
                // Pattern for URI used in save dialogue
                const pattern = this.config.useAutoNamingInSaveDialogues
                    ? this.config.autoNamingFormat
                    : this.variableResolver.defaultPattern;
                // Get Uri from save dialogue prompt
                const newUri = await this.promptForExport(
                    resource,
                    exportExtension,
                    pattern
                );

                // If valid, set filePath. Otherwise, return
                if (newUri) {
                    filePath = newUri.fsPath;
                } else {
                    return;
                }
            }
            // Use config for auto generation of filename
            else {
                // Filename for export
                const fileName = await this.variableResolver.resolveString(
                    this.config.autoNamingFormat,
                    resource,
                    exportExtension
                );
                // Set full file path; Make sure fileName is not already an absolute path
                filePath = path.isAbsolute(fileName)
                    ? fileName
                    : path.join(path.dirname(resource.fsPath), fileName);
            }

            // this.variableResolver.testVars(resource);   // TESTING / DEBUG

            // Set arguments
            arguments_.push('-o', filePath); // Filename for export

            // Check if a new preview can be opened
            if (
                !this.canOpenNewPreview(
                    this.openscadExecutableManager.executable,
                    resource,
                    arguments_
                )
            ) {
                return;
            }

            this.loggingService.logInfo(`Export uri: ${resource}`);

            this.previewStore.createAndAdd(
                this.openscadExecutableManager.executable,
                resource,
                arguments_
            );
        }
    }

    /** Prompt user for instances to kill */
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

        if (!selected) {
            return;
        } // Return if selected is undefined

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
        if (!previewToDelete) {
            return;
        }

        this.previewStore.delete(previewToDelete, this.config.showKillMessage);
    }

    /** Kill all the current previews */
    public killAll(): void {
        // Check that there are open previews
        if (this.previewStore.size <= 0) {
            this.loggingService.logError('No open previews');
            vscode.window.showInformationMessage('No open previews.');
            return;
        }

        this.previewStore.deleteAll(this.config.showKillMessage);
        // this._previews = undefined;
    }

    /** Constructor */

    public constructor(private loggingService: LoggingService) {
        this.previewStore = new PreviewStore(this.loggingService);
        this.variableResolver = new VariableResolver(this.loggingService);
        this.openscadExecutableManager = new OpenscadExecutableManager(
            this.loggingService
        );
        // Load configutation
        this.onDidChangeConfiguration(
            vscode.workspace.getConfiguration('openscad')
        );
    }

    /** Run when change configuration event */
    public onDidChangeConfiguration(
        config: vscode.WorkspaceConfiguration
    ): void {
        // Update configuration
        this.config.openscadPath = config.get<string>('launchPath');
        this.config.launchArgs = config.get<string[]>('launchArgs');
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

        this.loggingService.logDebug('Launch args:', this.config.launchArgs);

        this.openscadExecutableManager.updateScadPath(
            this.config.openscadPath,
            this.config.launchArgs
        );
        // Set the max previews
        this.previewStore.maxPreviews = this.config.maxInstances ?? 0;
    }

    /** Gets the uri of the active editor */
    private async getActiveEditorUri(): Promise<vscode.Uri | undefined> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return undefined;
        }

        // Make user save their document before previewing if it is untitled
        // TODO: Consider implementing as virtual (or just temp) document in the future
        if (editor.document.isUntitled) {
            vscode.window.showInformationMessage(
                'Save untitled document before previewing'
            );
            // Prompt save window
            return await vscode.window.showSaveDialog({
                defaultUri: editor.document.uri,
                filters: { 'OpenSCAD Designs': ['scad'] },
            });
        }
        // If document is already saved, set `resource`
        return editor.document.uri;
    }

    /** Prompts user for export name and location */
    private async promptForExport(
        resource: vscode.Uri,
        exportExtension: ExportFileExtension = 'stl',
        pattern: string = this.variableResolver.defaultPattern
    ): Promise<vscode.Uri | undefined> {
        // Replace the `.scad` file extrension with the preferred type (or default to stl)
        const fileName = await this.variableResolver.resolveString(
            pattern,
            resource,
            exportExtension
        ); // Filename for export
        const filePath = path.isAbsolute(fileName)
            ? fileName
            : path.join(path.dirname(resource.fsPath), fileName); // Full file path
        const resourceNewExtension = vscode.Uri.file(filePath); // Resource URI with new file extension

        this.loggingService.logDebug(`Opening Save Dialogue to: ${filePath}`);

        // Open save dialogue
        return await vscode.window.showSaveDialog({
            defaultUri: resourceNewExtension,
            filters: ExportExtensionsForSave,
        });
    }

    /** Returns if the current URI with arguments (output Y/N) can be opened */
    private canOpenNewPreview(
        openscadExecutable: OpenscadExecutable | undefined,
        resource: vscode.Uri,
        arguments_?: string[]
    ): openscadExecutable is OpenscadExecutable {
        // Make sure path to openscad.exe is valid
        if (!openscadExecutable) {
            // Error message for default
            const openscadPath = this.openscadExecutableManager.getPath();

            this.loggingService.logError(
                `Path to openscad command is invalid: "${openscadPath}"`
            );
            vscode.window.showErrorMessage(
                `Cannot find the command: "${openscadPath}". Make sure OpenSCAD is installed. You may need to specify the installation path under \`Settings > OpenSCAD > Launch Path\``
            );
            return false;
        }

        // Make sure we don't surpass max previews allowed
        if (
            this.previewStore.size >= this.previewStore.maxPreviews &&
            this.previewStore.maxPreviews > 0
        ) {
            this.loggingService.logError(
                'Max number of OpenSCAD previews already open.'
            );
            vscode.window.showErrorMessage(
                'Max number of OpenSCAD previews already open. Try increasing the max instances in the config.'
            );
            return false;
        }

        // Make sure file is not already open
        if (this.previewStore.get(resource, PreviewStore.hasGui(arguments_))) {
            this.loggingService.logInfo(
                `File is already open: "${resource.fsPath}"`
            );
            vscode.window.showInformationMessage(
                `${path.basename(resource.fsPath)} is already open: "${
                    resource.fsPath
                }"`
            );
            return false;
        }
        return true;
    }
}
