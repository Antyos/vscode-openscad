/**-----------------------------------------------------------------------------
 * Preview
 *
 * Stores a single instance of OpenSCAD
 *----------------------------------------------------------------------------*/

import * as child from 'child_process'; // node:child_process
import * as vscode from 'vscode';

import { OpenscadExecutable } from './openscad-exe';

export type PreviewType = 'view' | 'output';

/** Open an instance of OpenSCAD to preview a file */
export class Preview {
    private readonly _fileUri: vscode.Uri;
    private readonly _process: child.ChildProcess;
    private readonly _previewType: PreviewType;
    private _isRunning: boolean;
    private _onKilledCallbacks: (() => void)[] = [];

    /** Launch an instance of OpenSCAD to prview a file */
    constructor(
        private readonly openscadExecutable: OpenscadExecutable,
        fileUri: vscode.Uri,
        previewType?: PreviewType,
        arguments_: string[] = []
    ) {
        // Set local arguments
        this._fileUri = fileUri;
        this._previewType =
            previewType ??
            arguments_?.some((item) => ['-o', '--o'].includes(item))
                ? 'output'
                : 'view';

        // Prepend arguments to path if they exist
        const commandArguments: string[] = [
            ...this.openscadExecutable.arguments_,
            ...arguments_,
            this._fileUri.fsPath,
        ];

        console.log(`commangArgs: ${commandArguments}`); // DEBUG

        // New process
        this._process = child.execFile(
            this.openscadExecutable.filePath,
            commandArguments,
            (error, stdout, stderr) => {
                // If there's an error
                if (error) {
                    // console.error(`exec error: ${error}`);
                    console.error(`stderr: ${stderr}`); // DEBUG
                    vscode.window.showErrorMessage(stderr); // Display error message
                }
                // No error
                else {
                    // For some reason, OpenSCAD seems to use stderr for all console output...
                    // If there is no error, assume stderr should be treated as stdout
                    // For more info. see: https://github.com/openscad/openscad/issues/3358
                    const message = stdout || stderr;
                    console.log(`stdout: ${message}`); // DEBUG

                    vscode.window.showInformationMessage(message); // Display info
                }

                // console.log(`real stdout: ${stdout}`);    // DEBUG

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
        if (this._isRunning) this._process.kill();
        // this._isRunning = false;
    }

    /** Returns if the given Uri is equivalent to the preview's Uri */
    public matchUri(uri: vscode.Uri, previewType?: PreviewType): boolean {
        return (
            this._fileUri.toString() === uri.toString() &&
            this._previewType === (previewType ? previewType : 'view')
        );
    }

    /** Get Uri of file in preview */
    public get uri(): vscode.Uri {
        return this._fileUri;
    }

    public get isRunning(): boolean {
        return this._isRunning;
    }

    /** On killed handlers */
    public get onKilled() {
        return this._onKilledCallbacks;
    }

    public get previewType(): PreviewType {
        return this._previewType;
    }
}
