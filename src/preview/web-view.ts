import { Uri, Webview } from "vscode";

export function getWebviewContent(webview: Webview, extensionUri: Uri): string {
  // Get the URI for the web component's JavaScript file
  const componentScriptUri = webview.asWebviewUri(
    Uri.joinPath(extensionUri, 'node_modules', '@bascanada', 'cad-viewer', 'dist', 'components.js')
  );

  const nonce = getNonce(); // Helper function to generate a random nonce

  return `<!DOCTYPE html>
    <html lang="en" style="width: 100%; height: 100%;">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="Content-Security-Policy" content="
        default-src 'none';
        style-src ${webview.cspSource} 'unsafe-inline';
        script-src 'nonce-${nonce}';
      ">
      <title>SLT Viewer</title>
    </head>
    <body style="height: 100%; width: 100%; margin: 0;">
        <cad-viewer 
            id="cad-viewer"
            gizmoScale="0.7"
            viewerBackgroundColor="var(--vscode-editor-background)"
            toolbarBackgroundColor="var(--vscode-editorWidget-background, rgba(42, 42, 42, 0.8))"
            toolbarButtonBackgroundColor="var(--vscode-button-background)"
            toolbarButtonHoverBackgroundColor="var(--vscode-button-hoverBackground)"
            toolbarButtonForegroundColor="var(--vscode-button-foreground)"
            toolbarButtonBorderColor="var(--vscode-button-secondaryBackground, #666)"
            infoPanelBackgroundColor="var(--vscode-editorWidget-background, rgba(42, 42, 42, 0.8))"
            infoPanelForegroundColor="var(--vscode-editorWidget-foreground, #eee)"
            infoPanelSpanBackgroundColor="var(--vscode-input-background, #444)"
        ></cad-viewer>

        <script nonce="${nonce}" src="${componentScriptUri}"></script>
        <script nonce="${nonce}">
            const cadViewer = document.getElementById('cad-viewer');
            window.addEventListener('message', event => {
                const message = event.data; // The JSON data our extension sent
                if (message.stlData) {
                    if (typeof message.stlData === 'string') {
                        cadViewer.payload = message.stlData;
                    } else if (message.stlData.buffer instanceof ArrayBuffer) {
                        cadViewer.payload = message.stlData.buffer;
                    }
                }
            });
        </script>
    </body>
    </html>`;
}

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}