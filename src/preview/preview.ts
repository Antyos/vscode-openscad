/**-----------------------------------------------------------------------------
 * Preview
 *
 * Stores a single instance of OpenSCAD
 *----------------------------------------------------------------------------*/

import * as child from 'child_process'; // node:child_process
import * as vscode from 'vscode';

import { LoggingService } from 'src/logging-service';
import { OpenscadExecutable } from 'src/preview/openscad-exe';

/** Open an instance of OpenSCAD to preview a file */
export class Preview {
    private readonly _process: child.ChildProcess;
    private _isRunning: boolean;
    private _onKilledCallbacks: (() => void)[] = [];

    /** Launch an instance of OpenSCAD to prview a file */
    constructor(
        private readonly loggingService: LoggingService,
        private readonly context: vscode.ExtensionContext,
        private readonly openscadExecutable: OpenscadExecutable,
        public readonly uri: vscode.Uri,
        public readonly hasGui: boolean,
        arguments_: string[] = []
    ) {
        // Set local arguments
        this.uri = uri;

        // Prepend arguments to path if they exist
        const commandArguments: string[] = [
            ...this.openscadExecutable.arguments_,
            ...arguments_,
            this.uri.fsPath,
        ];

        this.loggingService.logDebug(
            `Executing with args: ${commandArguments}`
        );

        // New process
        this._process = child.execFile(
            this.openscadExecutable.filePath,
            commandArguments,
            { cwd: this.context.extensionPath.toString() },
            (error, stdout, stderr) => {
                // If there's an error
                if (error) {
                    // this.loggingService.logError(`exec error: ${error}`);
                    this.loggingService.logError(
                        `OpenSCAD exited with the error code: ${error}.`,
                        stderr
                    );
                    vscode.window.showErrorMessage(stderr); // Display error message
                }
                // No error
                else {
                    // For some reason, OpenSCAD seems to use stderr for all console output...
                    // If there is no error, assume stderr should be treated as stdout
                    // For more info. see: https://github.com/openscad/openscad/issues/3358
                    const message = stdout || stderr;
                    this.loggingService.logDebug(
                        `OpenSCAD exited with the following message: ${message}`
                    );
                    vscode.window.showInformationMessage(message);
                }

                // this.loggingService.logDebug(`real stdout: ${stdout}`);

                this._isRunning = false;
                // Dispatch 'onKilled' event
                for (const callback of this._onKilledCallbacks) {
                    callback();
                }
            }
        );

        // Child process is now running
        this._isRunning = true;
    }

    /** Kill child process */
    public dispose(): void {
        if (this._isRunning) {
            this._process.kill();
        }
        // this._isRunning = false;
    }

    /** Returns if the given Uri is equivalent to the preview's Uri */
    public match(uri: vscode.Uri, hasGui?: boolean): boolean {
        return (
            this.uri.toString() === uri.toString() &&
            (hasGui === undefined || this.hasGui === hasGui)
        );
    }

    public get isRunning() {
        return this._isRunning;
    }

    /** On killed handlers */
    public get onKilled() {
        return this._onKilledCallbacks;
    }
}
