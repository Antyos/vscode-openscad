import { getWebviewContent } from 'src/preview/web-view';
import * as vscode from 'vscode';



import { OpenScadDataManager } from '../vfs/data-manager';
export function previewPanelCommand(
    mode: string, // not used anymore, but kept for signature compatibility
    context: vscode.ExtensionContext,
    openPreviewUris: Set<string>,
    dataManager: OpenScadDataManager,
    onStlRefresh: (listener: (uri: vscode.Uri) => any) => vscode.Disposable
): (uri: vscode.Uri) => void {
    return (uri: vscode.Uri) => {
        openPreviewUris.add(uri.toString());
        const panel = vscode.window.createWebviewPanel(
            'myWebApp',
            'My Web App',
            vscode.ViewColumn.Two,
            {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'node_modules', '@bascanada', 'cad-viewer', 'dist')],
            }
        );

        let currentStlPayload = '';
        let wasPanelVisible = panel.visible;

        panel.webview.html = getWebviewContent(panel.webview, context.extensionUri);

        // Helper to get STL from manager and post to webview
        const fetchAndPostSTL = async () => {
            try {
                await dataManager.triggerCompilation(uri);
                const stlBuffer = dataManager.getSTL(uri);
                if (stlBuffer) {
                    currentStlPayload = stlBuffer.toString();
                    panel.webview.postMessage({ stlData: currentStlPayload });
                }
            } catch (err) {
                console.error('Error fetching STL from manager:', err);
            }
        };


        // Initial load
        fetchAndPostSTL();

        // Listen for STL refresh events for this URI
        const stlRefreshDisposable = onStlRefresh((changedUri) => {
            if (changedUri.toString() === uri.toString() && panel.visible) {
                fetchAndPostSTL();
            }
        });

        const onDidChangeViewStateDisposable = panel.onDidChangeViewState(e => {
            const isPanelNowVisible = e.webviewPanel.visible;
            if (isPanelNowVisible && !wasPanelVisible) {
                if (currentStlPayload) {
                    panel.webview.postMessage({ stlData: currentStlPayload });
                }
            }
            wasPanelVisible = isPanelNowVisible;
        });


        panel.onDidDispose(() => {
            onDidChangeViewStateDisposable.dispose();
            stlRefreshDisposable.dispose();
            openPreviewUris.delete(uri.toString());
        }, null, context.subscriptions);
    }
}