import * as vscode from 'vscode';
import { ScadConfig } from './config';
import { Preview }  from './preview';

// Launcher class to handle launching instance of scad 
export class PreviewManager {
    // Command IDs
    public static readonly commandId = {
        preview: 'scad.preview',
        kill: 'scad.kill'
    }

    public preview?: Preview;

    // private openscadPath: string | undefined;
    private config: ScadConfig = {};

    // public activate() {}

    // Opens the current file in OpenSCAD
    public openCurrentFile(/*resource: vscode.Uri | undefined, args: string[] | undefined */) {
        if (!vscode.window.activeTextEditor) { 
            console.error("No active text editor");
            return; 
        }

        if (this.preview) {
            console.error("Preview window already open"); 
            return;
        }


        const currentFile = vscode.window.activeTextEditor.document.uri;

        this.preview = Preview.create(currentFile);
        
    }

    // Kill the current preview
    public kill() {
        if (!this.preview) {
            console.error("No open previews");
            return;
        }

        this.preview.dispose();
        this.preview = undefined;
    }

    // Constructor
    public constructor() {
        // Load configutation
        this.onDidChangeConfiguration(vscode.workspace.getConfiguration('openscad')); 
    }

    // Run when change configuration event
    public onDidChangeConfiguration(config: vscode.WorkspaceConfiguration) {
        this.config.openscadPath = config.get<string>('launchPath');
        this.config.maxInstances = config.get<number>('maxInstances');

        // Set the path in the preview
        if (this.config.openscadPath) {
            Preview.setScadPath(this.config.openscadPath);
        }
        // this.openscadPath = config.get<string>('preview');
        
    }
}