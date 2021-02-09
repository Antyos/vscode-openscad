import * as vscode from 'vscode';
import * as languageclient from 'vscode-languageclient/node';
import * as net from 'net';

let langclient: languageclient.LanguageClient;

export function activateLanguageServer(context: vscode.ExtensionContext): void {
    const outputChannel: vscode.OutputChannel = vscode.window.createOutputChannel(
        'OpenSCAD'
    );
    // The server is implemented in node
    const connectionInfo = {
        port: 23725, // 0x5cad
        host: 'localhost',
    };

    const serverOptions = () => {
        // Connect to language server via socket
        const socket = net.connect(connectionInfo);
        const result: languageclient.StreamInfo = {
            writer: socket,
            reader: socket,
        };

        outputChannel.appendLine(
            '[client] Connecting to openscad on port ' + connectionInfo.port
        );
        console.log(
            'Opening connection to ',
            connectionInfo.host + ':' + connectionInfo.port
        );

        return Promise.resolve(result);
    };

    // Options to control the language client
    const clientOptions: languageclient.LanguageClientOptions = {
        documentSelector: [{ scheme: 'file', language: 'scad' }],
        synchronize: {},
        outputChannel,
        outputChannelName: 'OpenSCAD',
        revealOutputChannelOn: languageclient.RevealOutputChannelOn.Info,
    };

    // Create the language client and start the client.
    langclient = new languageclient.LanguageClient(
        'openscad-lsp',
        'OpenSCAD Language Server',
        serverOptions,
        clientOptions
    );
    langclient.registerProposedFeatures();

    // enable tracing (.Off, .Messages, Verbose)
    langclient.trace = languageclient.Trace.Verbose;

    // Start the client. This will also launch the server
    const disposable = langclient.start();

    // Push the disposable to the context's subscriptions so that the
    // client can be deactivated on extension deactivation
    context.subscriptions.push(disposable);

    langclient.onReady().then(() => {
        outputChannel.appendLine('[client] Connection has been established');

        // Only register the commands when the connection has been established.
        context.subscriptions.push(
            vscode.commands.registerCommand('openscad.lsp.preview', () => {
                const editor = vscode.window.activeTextEditor;
                if (editor) {
                    langclient.sendRequest('$openscad/preview', {
                        uri: editor.document.uri.toString(),
                    });
                }
            })
        );

        vscode.commands.executeCommand('openscad.lsp.preview');
    });
}
