import * as vscode from 'vscode';
import { Preview }  from './preview';

// Used to keep track of Set of Previews
export class PreviewStore /* extends vscode.Disposable */ {
    private readonly _previews = new Set<Preview>();
    private _maxPreviews: number;

    // Dispose of the PreviewStore
    public dispose(): void {
        // super.dispose();
        for (const preview of this._previews) {
            preview.dispose();
        }
        this._previews.clear();
    }
    
    // Defines: PreviewStore[]
    [Symbol.iterator](): Iterator<Preview> {
        return this._previews[Symbol.iterator]();
    }
    
    // Constructor
    public constructor(maxPreviews?: number) {
        this._maxPreviews = maxPreviews ? maxPreviews : 0;
    }

    // Clean up any non-running previews
    // public cleanup() {
    //     for (const preview of this._previews) {
    //         if (!preview.isRunning) {
    //             this._previews.delete(preview);
    //         }
    //     }
    // }

    // Finds a resource in the PreviewStore by uri
    // Returns the preview if found, otherwise undefined
    public get(resource: vscode.Uri): Preview | undefined {
        for (const preview of this._previews) {
            if (preview.matchUri(resource)) {
                return preview;
            }
        }
        return undefined;
    }

    // Add preview
    public add(preview: Preview) {
        this._previews.add(preview)
        preview.onKilled.subscribe(() => this._previews.delete(preview)); // Auto delete when killed
    }

    // Create new preview (if not one with same uri) and then add it
    public createAndAdd(uri: vscode.Uri, args?: string[]) {
        if (this.get(uri) === undefined) {
            const newPreview = Preview.create(uri, args);
            if (newPreview) this.add(newPreview);
        }
    }

    // Delete and dispose of a preview
    public delete(preview: Preview, informUser?: boolean) {
        preview.dispose();
        if (informUser) vscode.window.showInformationMessage(`Killed: ${preview.uri.path.replace(/\/.*\//g, '')}`);
        this._previews.delete(preview);
    }

    // Functionally same as dispose() but without super.dispose()
    public deleteAll(informUser?: boolean) {
        for (const preview of this._previews) {
            preview.dispose();
            if (informUser) vscode.window.showInformationMessage(`Killed: ${preview.uri.path.replace(/\/.*\//g, '')}`);
        }
        this._previews.clear();
    }

    // Returns a list of all the uris
    public getUris(): vscode.Uri[] {
        let uris: vscode.Uri[] = [];

        // this.cleanup(); // Clean up any killed instances that weren't caught

        for (const preview of this._previews) {
            uris.push(preview.uri);
        }

        return uris;
    }

    // Returns size (length) of PreviewStore
    public get size() {
        return this._previews.size;
    }

    public get maxPreviews(): number { return this._maxPreviews; }
    public set maxPreviews(num: number) { this._maxPreviews = num; }

}