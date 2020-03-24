import * as vscode from 'vscode';
import * as child from 'child_process';
import * as fs from 'fs';
import { SignalDispatcher } from 'ste-signals';

// Preview class to open instance of OpenSCAD
export class Preview {
    // Paths
    private static _scadPath: string;
    private static _isValidScadPath: boolean;
    private readonly _fileUri: vscode.Uri;
    private readonly _process: child.ChildProcess;
    private _isRunning: boolean;
    private _onKilled = new SignalDispatcher();

    // Constructor
    private constructor(fileUri: vscode.Uri, args?: string[] | undefined) {
        // Set local arguments
        this._fileUri = fileUri;

        const commandArgs: string[] = (args) ? args.concat(this._fileUri.fsPath) : [this._fileUri.fsPath];

        console.log(`commangArgs: ${commandArgs}`); // DEBUG

        // New process
        this._process = child.spawn(Preview._scadPath, commandArgs);

        // Set exit conditions or something like that
        this._process.stdout.on('data', (data) => {
            console.log(data.toString());
        });
          
        this._process.stderr.on('data', (data) => {
            console.error(data.toString());
        });
        
        // Run on child exit
        this._process.on('exit', (code) => {
            console.log(`Child exited with code ${code}`);
            this._isRunning = false;
            this._onKilled.dispatch();  // Dispatch 'onKilled' event
        });

        // Child process is now running
        this._isRunning = true;
    }

    // Kill child process
    public dispose() {
        if (this._isRunning) this._process.kill();
        // this._isRunning = false;
    }

    // Returns if the given Uri is equivalent to the preview's Uri
    public matchUri(uri: vscode.Uri): boolean {
        return (this._fileUri.toString() === uri.toString());
    }

    // Return Uri
    public get uri(): vscode.Uri { return this._fileUri; }

    // Get if running
    public get isRunning(): boolean { return this._isRunning; }

    // On killed handlers
    public get onKilled() {
        return this._onKilled.asEvent();
    }

    // Static factory method. Create new preview child process
    // Needed to make sure path to `openscad.exe` is defined
    public static create(resource: vscode.Uri, args?: string[]): Preview | undefined {
        // Error checking
        // Make sure scad path is defined
        if (!Preview._scadPath) {
            console.error("OpenSCAD path is undefined in config");
            vscode.window.showErrorMessage("OpenSCAD path does not exist.");
            return undefined;
        }

        // New file
        return new Preview(resource, args);
        
    }

    // Used to set the path to `openscad.exe` on the system. Necessary to open children
    // TODO: Config is override. Autodetects path by OS otherwise
    public static set scadPath(scadPath: string) {
        Preview._scadPath = scadPath;
        console.log(`Path: '${this._scadPath}'`);   // DEBUG
        this._isValidScadPath = fs.existsSync(Preview._scadPath);
    }

    public static get scadPath(): string {
        return Preview._scadPath;
    }

    public static get isValidScadPath() : boolean {
        return this._isValidScadPath;
    }
}