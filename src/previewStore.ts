import * as vscode from 'vscode';
import { Preview }  from './preview';

// Used to keep track of Set of Previews
export class PreviewStore /* extends vscode.Disposable */ {
    private readonly _previews = new Set<Preview>();
    private maxPreviews: number;

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
        this.maxPreviews = maxPreviews ? maxPreviews : 0;
    }

    // Clean up any non-running previews
    // TODO: Convert to emmit onKilled() event to delete old previews instead of requireing cleanup()
    public cleanup() {
        for (const preview of this._previews) {
            if (!preview.isRunning()) {
                this._previews.delete(preview);
            }
        }
    }

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
    }

    // Delete and dispose of a preview
    public delete(preview: Preview, informUser?: boolean) {
        preview.dispose();
        if (informUser) vscode.window.showInformationMessage(`Killed: ${preview.getUri().path.replace(/\/.*\//g, '')}`);
        this._previews.delete(preview);
    }

    // Functionally same as dispose() but without super.dispose()
    public deleteAll(informUser?: boolean) {
        for (const preview of this._previews) {
            preview.dispose();
            if (informUser) vscode.window.showInformationMessage(`Killed: ${preview.getUri().path.replace(/\/.*\//g, '')}`);
        }
        this._previews.clear();
    }

    // Returns a list of all the uris
    public getUris(): vscode.Uri[] {
        let uris: vscode.Uri[] = [];

        this.cleanup(); // Clean up any killed instances that weren't caught

        for (const preview of this._previews) {
            uris.push(preview.getUri());
        }

        return uris;
    }

    // Returns size (length) of PreviewStore
    public size() {
        return this._previews.size;
    }

    // Get max previews
    public getMaxPreviews() { return this.maxPreviews; }
    // Set max previews
    public setMaxPreviews(num: number) { this.maxPreviews = num; }

}