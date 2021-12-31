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
    auto: 'cheatsheet-auto.css',
    original: 'cheatsheet-original.css',
};

type StyleKey = keyof typeof STYLES;

/** Default style */
export const DEFAULT_STYLE: StyleKey = 'auto';

export class CheatsheetStyles {
    public readonly styles: { [key in StyleKey]: vscode.Uri };
    public readonly defaultStyle: vscode.Uri;

    // Allow `___ of Styles` to iterate over _styles
    *[Symbol.iterator](): Iterator<StyleKey> {
        yield* Object.keys(this.styles) as StyleKey[];
    }

    public constructor(stylesUri: vscode.Uri) {
        // Map STYLES to Uris relative to `extensionUri`.
        //
        // Note: because we are compiling to ES6, we can't use
        // Object.fromEntries(), so we have to emulate it:
        // https://stackoverflow.com/a/43682482
        this.styles = Object.assign(
            {},
            ...Object.entries(STYLES).map(([styleKey, stylePath]) => {
                return {
                    [styleKey]: vscode.Uri.joinPath(stylesUri, stylePath).with({
                        scheme: 'file',
                    }),
                };
            })
        );

        // Set the default style
        this.defaultStyle = this.styles[DEFAULT_STYLE];
    }
}
