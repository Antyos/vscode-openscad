import * as vscode from 'vscode';
import * as child from 'child_process';

// Preview class to open OpenSCAD
export class Preview {
    // Paths
    private static _scadPath: string;
    private readonly _fileUri: vscode.Uri;
    private readonly _process: child.ChildProcess;
    private _isRunning: boolean;

    // Constructor
    private constructor(fileUri: vscode.Uri, args?: string[] | undefined) {
        // Set local arguments
        this._fileUri = fileUri;

        // const commandArgs: string[] = (args) ? args?.concat(filePath) : [filePath];
        const commandArgs: string[] = [this._fileUri.fsPath];

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
        
        this._process.on('exit', (code) => {
            console.log(`Child exited with code ${code}`);
        });

        // Child process is now running
        this._isRunning = true;
    }

    // Kill child process
    public dispose() {
        this._process.kill();
        this._isRunning = false;
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
        return new Preview(resource);
        
    }

    // Used to set the path to `openscad.exe` on the system. Necessary to open children
    public static setScadPath(scadPath: string){
        Preview._scadPath = scadPath;
        console.log(`Path: '${this._scadPath}'`);   // DEBUG
    }
}