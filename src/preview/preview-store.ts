/**-----------------------------------------------------------------------------
 * Preview Store
 *
 * Class to manage a Set of previews
 *----------------------------------------------------------------------------*/

import { basename } from 'path'; // node:path
import * as vscode from 'vscode';

import { Preview, PreviewType } from './preview';

/** Container of several Preview */
export class PreviewStore /* extends vscode.Disposable */ {
    private static readonly areOpenScadPreviewsContextKey =
        'areOpenScadPreviews';

    private readonly _previews = new Set<Preview>();
    private _maxPreviews: number;

    /** Dispose of the PreviewStore */
    public dispose(): void {
        // super.dispose();
        for (const preview of this._previews) {
            preview.dispose();
        }
        this._previews.clear();
    }

    /** Defines behavior for `PreviewStore[]` */
    [Symbol.iterator](): Iterator<Preview> {
        return this._previews[Symbol.iterator]();
    }

    /** Create a new PreviewStore with a max number of previews */
    public constructor(maxPreviews?: number) {
        this._maxPreviews = maxPreviews ? maxPreviews : 0;
        this.setAreOpenPreviews(false);
    }

    /**
     * Find a resource in the PreviewStore by uri
     * @returns {Preview | undefined} Preview if found, otherwise undefined
     */
    public get(
        resource: vscode.Uri,
        previewType?: PreviewType
    ): Preview | undefined {
        for (const preview of this._previews) {
            if (preview.matchUri(resource, previewType)) {
                return preview;
            }
        }
        return undefined;
    }

    /** Add a preview to PreviewStore */
    public add(preview: Preview): void {
        this._previews.add(preview);
        preview.onKilled.push(() => this._previews.delete(preview)); // Auto delete when killed
        this.setAreOpenPreviews(true);
    }

    /** Create new preview (if not one with same uri) and then add it. */
    public createAndAdd(
        uri: vscode.Uri,
        arguments_?: string[]
    ): Preview | undefined {
        const previewType = PreviewStore.getPreviewType(arguments_);

        // Check there's not an existing preview of same type (can view and export same file)
        if (this.get(uri, previewType) === undefined) {
            const newPreview = Preview.create(uri, previewType, arguments_);

            if (!newPreview) return undefined;

            this.add(newPreview);
            if (newPreview.previewType === 'output')
                this.makeExportProgressBar(newPreview);

            return newPreview;
        }
        return undefined;
    }

    /** Delete and dispose of a preview. */
    public delete(preview: Preview, informUser?: boolean): void {
        preview.dispose();
        if (informUser)
            vscode.window.showInformationMessage(
                `Killed: ${basename(preview.uri.fsPath)}`
            );
        this._previews.delete(preview);

        if (this.size === 0) {
            this.setAreOpenPreviews(false);
        }
    }

    /** Functionally same as dispose() but without super.dispose(). */
    public deleteAll(informUser?: boolean): void {
        for (const preview of this._previews) {
            preview.dispose();
            if (informUser)
                vscode.window.showInformationMessage(
                    `Killed: ${basename(preview.uri.fsPath)}`
                );
        }
        this._previews.clear();

        this.setAreOpenPreviews(false);
    }

    /** Get the list of all open URIs. */
    public getUris(): vscode.Uri[] {
        const uris: vscode.Uri[] = [];

        // this.cleanup(); // Clean up any killed instances that weren't caught

        for (const preview of this._previews) {
            uris.push(preview.uri);
        }

        return uris;
    }

    /** Create progress bar for exporting. */
    public makeExportProgressBar(preview: Preview): void {
        // Progress window
        vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title: `Exporting: ${basename(preview.uri.fsPath)}`,
                cancellable: true,
            },
            (progress, token) => {
                // Create and add new OpenSCAD preview to PreviewStore

                // Cancel export
                token.onCancellationRequested(() => {
                    console.log('Canceled Export');
                    this.delete(preview);
                });

                // Return promise that resolve the progress bar when the preview is killed
                const p = new Promise<void>((resolve) => {
                    preview.onKilled.push(() => resolve());
                });

                return p;
            }
        );
    }

    /** Returns the preview type based on the arguments supplied. */
    public static getPreviewType(arguments_?: string[]): 'output' | 'view' {
        return arguments_?.some((item) => ['-o', '--o'].includes(item))
            ? 'output'
            : 'view';
    }

    /** Returns size (length) of PreviewStore. */
    public get size(): number {
        return this._previews.size;
    }

    public get maxPreviews(): number {
        return this._maxPreviews;
    }
    public set maxPreviews(number_: number) {
        this._maxPreviews = number_;
    }

    /** Set vscode context 'areOpenPreviews'. Used in 'when' clauses. */
    private setAreOpenPreviews(value: boolean): void {
        vscode.commands.executeCommand(
            'setContext',
            PreviewStore.areOpenScadPreviewsContextKey,
            value
        );
    }
}
