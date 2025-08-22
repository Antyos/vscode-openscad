import * as vscode from 'vscode';
import * as path from 'path';

import { PreviewManager } from 'src/preview/preview-manager';
import { LoggingService } from 'src/logging-service';

/**
 * Register the Chat Context Provider if the proposed Chat API is available.
 * Safe no-op otherwise.
 */
export function registerChatContextProvider(
    context: vscode.ExtensionContext,
    previewManager: PreviewManager,
    loggingService: LoggingService
): void {
    // Check if the 'chat' API and its 'registerChatContextProvider' method exist
    if ('chat' in vscode && 'registerChatContextProvider' in (vscode as any).chat) {
        const provider = (vscode as any).chat.registerChatContextProvider('openscad-context', {
            provideChatContext(token: vscode.CancellationToken) {
                const editor = vscode.window.activeTextEditor;

                // Only provide context if an OpenScad file is active
                if (!editor || editor.document.languageId !== 'scad') {
                    return [];
                }

                // Determine workspace root
                const workspaceRoot = (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0])?.uri;

                // Dynamically determine the debug path
                const relativePath = workspaceRoot
                    ? path.relative(workspaceRoot.fsPath, editor.document.uri.fsPath)
                    : editor.document.uri.path;
                const debugPath = path.join('.openscad', 'debug', relativePath);

                // Check if the preview panel is open for this document
                const isPreviewOpen = previewManager.isPreviewActiveFor(editor.document.uri);
                const previewStatus = isPreviewOpen
                    ? 'The user currently has the 3D preview panel open for this file.'
                    : 'The user does not have the 3D preview panel open.';

                // Instructional text for AI context
                return [
                    {
                        content: `The user is working on the OpenSCAD file '${relativePath}'.\n- ${previewStatus}\n- To get detailed information about this model, you can read files from the '${debugPath}' directory.\n- This directory contains: dimensions.json, scene-graph.csg, preview.png, model.stl, render.log, and error.log.\n- If these files are missing or outdated, ask the user to run the command 'OpenSCAD: Generate Debug Files for AI Assistant'.`,
                    },
                ];
            },
        });

        if (provider) {
            context.subscriptions.push(provider);
            loggingService.logDebug('ChatContextProvider registered: openscad-context');
        }
    } else {
        // Optional: Log that the feature is unavailable on this version of VS Code
        console.log('ChatContextProvider API is not available. AI context feature disabled.');
        loggingService.logDebug('ChatContextProvider API is not available. AI context feature disabled.');
    }
}
