/**
 * Cheatsheet styles
 */

import * as vscode from 'vscode';

// We could make some wrapper class for this, but we don't have enough .css files for that to
// be worth it.

/**
 * Available css styles for Cheatsheet. Paths are relative to [extensionUri].
 */
export const STYLES = {
    auto: 'media/cheatsheet/cheatsheet-auto.css',
    original: 'media/cheatsheet/cheatsheet-original.css',
};

type StyleKey = keyof typeof STYLES;

function isStyleKey(key: string): key is StyleKey {
    return key in STYLES;
}

/** Default style */
export const DEFAULT_STYLE: StyleKey = 'auto';

export class Styles {
    private readonly _extensionUri: vscode.Uri;
    private _styles: { [key in StyleKey]: vscode.Uri };
    public defaultStyle: vscode.Uri;

    // Allow `___ of Styles` to iterate over _styles
    *[Symbol.iterator]() {
        yield* Object.keys(this._styles);
    }

    public constructor(extensionUri: vscode.Uri) {
        this._extensionUri = extensionUri;

        // Map STYLES to Uris relative to `extensionUri`.
        //
        // Note: because we are compiling to ES6, we can't use
        // Object.fromEntries(), so we have to emulate it:
        // https://stackoverflow.com/a/43682482
        this._styles = Object.assign(
            {},
            ...Object.entries(STYLES).map(([styleKey, stylePath]) => {
                return {
                    [styleKey]: vscode.Uri.joinPath(extensionUri, stylePath),
                };
            })
        );

        // Set the default style
        this.defaultStyle = this._styles[DEFAULT_STYLE];
    }

    /** Get Uri to stylesheet based on a key. Returns undefined if invalid key. */
    public getStyleUri<T extends StyleKey | string>(
        styleKey: T
    ): T extends StyleKey ? vscode.Uri : undefined {
        return isStyleKey(styleKey)
            ? this._styles[styleKey as keyof typeof STYLES]
            : undefined;
    }
}
