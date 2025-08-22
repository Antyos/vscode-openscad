/**-----------------------------------------------------------------------------
 * Extension
 *
 * Main file for activating extension
 *----------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import * as path from 'path';

import { Cheatsheet } from 'src/cheatsheet/cheatsheet-panel';
import { PreviewManager } from 'src/preview/preview-manager';
import { LoggingService } from './logging-service';
import { previewPanelCommand } from './preview/openscad-panel';
import { registerChatContextProvider } from 'src/chat/chat-context-provider';

import { OpenScadDataManager } from './vfs/data-manager';
import { OpenScadVFSProvider } from './vfs/vfs-provider';
import { vfsFilePreview } from './preview/vfs-file-preview';
import { DebugFileManager } from './debug/debug-manager';
import { debugCommands } from './debug/debug-commands';

const extensionName = process.env.EXTENSION_NAME || 'antyos.openscad';
const extensionVersion = process.env.EXTENSION_VERSION || '0.0.0';

/** Called when extension is activated */
export function activate(context: vscode.ExtensionContext): void {
    // Read initial config for debug auto-write
    let autoWriteDebugOnSave = vscode.workspace.getConfiguration('openscad').get<boolean>('debug.autoWriteOnSave', true);

    // Event emitter to notify panels to refresh STL after compilation
    const stlRefreshEmitter = new vscode.EventEmitter<vscode.Uri>();
    const onStlRefresh = stlRefreshEmitter.event;
    // Track which URIs have an open preview panel
    const openPreviewUris = new Set<string>();
    // --- VFS Initialization ---
    const dataManager = new OpenScadDataManager();
    const vfsProvider = new OpenScadVFSProvider(dataManager);
    context.subscriptions.push(
        vscode.workspace.registerFileSystemProvider('openscad-debug', vfsProvider, { isCaseSensitive: true })
    );

    // Debug manager (optional) - only when a workspace folder is open
    let debugManager: DebugFileManager | undefined = undefined;
    if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
        debugManager = new DebugFileManager(vscode.workspace.workspaceFolders[0].uri);
    }

    // --- Trigger Eager Compilation on Save ---
    context.subscriptions.push(
        vscode.workspace.onDidSaveTextDocument(async (document) => {
            // Only trigger compilation if this file has an open preview panel
            if ((document.languageId === 'scad' || document.fileName.endsWith('.scad')) && openPreviewUris.has(document.uri.toString())) {
                vscode.window.withProgress({
                    location: vscode.ProgressLocation.Window,
                    title: 'Compiling OpenSCAD STL...'
                }, async () => {
                    await dataManager.triggerCompilation(document.uri);
                    stlRefreshEmitter.fire(document.uri);
                });
            }

            // Optionally write debug files on each save if enabled
            if (autoWriteDebugOnSave && debugManager) {
                // Run in background notification
                void vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: 'Writing OpenSCAD debug files...' }, async () => {
                    try {
                        await debugManager!.updateAllDebugFiles(document.uri);
                    } catch (err: any) {
                        // Don't block save; show an error notification
                        vscode.window.showErrorMessage(`Failed to write OpenSCAD debug files: ${err?.message ?? String(err)}`);
                    }
                });
            }
        })
    );

    const loggingService = new LoggingService();

    loggingService.logInfo(`Activating ${extensionName} v${extensionVersion}`);

    /** New launch object */
    const previewManager = new PreviewManager(loggingService, context);

    // Register chat context provider (separate module)
    registerChatContextProvider(context, previewManager, loggingService);

    // Register commands
    const commands = [
        vscode.commands.registerCommand(Cheatsheet.csCommandId, () =>
            Cheatsheet.createOrShowPanel(context.extensionUri)
        ),
        vscode.commands.registerCommand(
            'openscad.preview',
            (mainUri, allUris) => previewManager.openFile(mainUri, allUris)
        ),
        vscode.commands.registerCommand('openscad.previewPanel', previewPanelCommand('native', context, openPreviewUris, dataManager, onStlRefresh)),
        vscode.commands.registerCommand('openscad.showErrorLog', vfsFilePreview('/error.log')),
        vscode.commands.registerCommand('openscad.showRenderLog', vfsFilePreview('/render.log')),
        vscode.commands.registerCommand('openscad.showDimensions', vfsFilePreview('/dimensions.json')),
        vscode.commands.registerCommand('openscad.showSceneGraph', vfsFilePreview('/scene-graph.csg')),
        vscode.commands.registerCommand('openscad.showPreviewImage', vfsFilePreview('/preview.png')),
        vscode.commands.registerCommand('openscad.showStl', vfsFilePreview('/model.stl')),
        vscode.commands.registerCommand('openscad.writeDebugFiles', debugCommands(debugManager)),
        vscode.commands.registerCommand(
            'openscad.exportByType',
            (mainUri, allUris) => previewManager.exportFile(mainUri, allUris)
        ),
        vscode.commands.registerCommand(
            'openscad.exportByConfig',
            (mainUri, allUris) =>
                previewManager.exportFile(mainUri, allUris, 'auto')
        ),
        vscode.commands.registerCommand(
            'openscad.exportWithSaveDialogue',
            (mainUri, allUris) =>
                previewManager.exportFile(mainUri, allUris, 'auto', true)
        ),
        vscode.commands.registerCommand('openscad.kill', () =>
            previewManager.kill()
        ),
        vscode.commands.registerCommand('openscad.autoKill', () =>
            previewManager.kill(true)
        ),
        vscode.commands.registerCommand('openscad.killAll', () =>
            previewManager.killAll()
        ),
        vscode.commands.registerCommand('openscad.showOutput', () => {
            loggingService.show();
        }),

    ];

    // Register commands, event listeners, and status bar item
    context.subscriptions.push(
        ...commands,
        Cheatsheet.getStatusBarItem(),
        vscode.window.onDidChangeActiveTextEditor(onDidChangeActiveTextEditor),
        vscode.workspace.onDidChangeConfiguration(onDidChangeConfiguration)
    );
    // onDidChangeConfiguration();

    // Update status bar item once at start
    Cheatsheet.updateStatusBar();

    // Register serializer event action to recreate webview panel if vscode restarts
    if (vscode.window.registerWebviewPanelSerializer) {
        // Make sure we register a serializer in action event
        vscode.window.registerWebviewPanelSerializer(Cheatsheet.viewType, {
            async deserializeWebviewPanel(
                webviewPanel: vscode.WebviewPanel,
                state: unknown
            ) {
                loggingService.logInfo(
                    `Got webview state: ${state}. Reviving Cheatsheet`
                );
                Cheatsheet.revive(webviewPanel, context.extensionUri);
            },
        });
    }

    /** Run on active change text editor */
    function onDidChangeActiveTextEditor() {
        Cheatsheet.onDidChangeActiveTextEditor();
    }

    /** Run when configuration is changed */
    function onDidChangeConfiguration() {
        const config = vscode.workspace.getConfiguration('openscad'); // Get new config
        Cheatsheet.onDidChangeConfiguration(config); // Update the cheatsheet with new config
        previewManager.onDidChangeConfiguration(config); // Update launcher with new config
        loggingService.logDebug('Config change!');
        loggingService.setOutputLevel(config.get('logLevel') ?? 'NONE');
        // Update debug auto-write flag
        autoWriteDebugOnSave = config.get<boolean>('debug.autoWriteOnSave', false);
    }
}

/** Called when extension is deactivated */
// export function deactivate() {}
