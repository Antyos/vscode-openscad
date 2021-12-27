import { HTMLElement, parse } from 'node-html-parser';
import * as vscode from 'vscode';

/** Cheatsheet color schemes. Located in `[extensionPath]/media/cheatsheet/` */
const colorScheme = {
    original: 'cheatsheet-original.css',
    auto: 'cheatsheet-auto.css',
};

const DEFAULT_STYLE = 'auto';

/** Get HTML content of the OpenSCAD cheatsheet */
export class CheatsheetContent {
    /** Uri to the directory containing the cheatsheet html and style sheets */
    private readonly _cheatsheetUri: vscode.Uri;
    /** Stored copy of the cheatsheet HTML document */
    private _content?: string = undefined;
    /** The last key used to get the cheatsheet stylesheet */
    private _lastStyleKey?: string = undefined;

    public constructor(cheatsheetUri: vscode.Uri) {
        this._cheatsheetUri = cheatsheetUri;
    }

    /** Get cheatsheet HTML content. Stores HTML from lastStyleKey. */
    public getContent(styleKey: string): Promise<string> {
        // If the styleKey hasn't changed, return the stored copy of the document
        if (styleKey === this._lastStyleKey && this._content) {
            return new Promise<string>((resolve) => {
                resolve(this._content || '');
            });
        }

        // Update lastStyleKey. If we do this inside the next promise, we may
        // create a race condition if two calls to getContent() are made before
        // the promises can be resolved.
        this._lastStyleKey = styleKey;

        // Get the new document
        return new Promise((resolve) => {
            this.getCheatsheetContent(styleKey).then((content) => {
                // Store content for later
                this._content = content;
                resolve(content);
            });
        });
    }

    /** The key used the last time getContent() was called */
    public get lastStyleKey(): string | undefined {
        return this._lastStyleKey;
    }

    /** Get the file URI to the style sheet */
    private getStyleSheetUri(styleKey: string): vscode.Uri {
        // Get the filename of the given colorScheme
        // Thank you: https://blog.smartlogic.io/accessing-object-attributes-based-on-a-variable-in-typescript/
        const styleSource =
            styleKey in colorScheme
                ? colorScheme[styleKey as keyof typeof colorScheme]
                : colorScheme[DEFAULT_STYLE];

        // Get style sheet URI
        return vscode.Uri.joinPath(this._cheatsheetUri, styleSource).with({
            scheme: 'vscode-resource',
        });
        // if (DEBUG) console.log("Style" + styleUri); // DEBUG
    }

    /**
     * Get a <link> HTMLElement for a stylesheet.
     * @param stylesheetRef Key to lookup the desired stylesheet
     * @returns HTMLElement
     */
    private getStyleSheetElement(stylesheetReference: string): HTMLElement {
        // HTMLElement `parent` argument cannot be type 'undefined', so we have
        // to disable the check here
        // eslint-disable-next-line unicorn/no-null
        const element = new HTMLElement('link', { id: '' }, '', null);
        const attributes = {
            type: 'text/css',
            rel: 'stylesheet',
            href: stylesheetReference,
            media: 'all',
        };

        element.setAttributes(attributes);

        return element;
    }

    /** Get the cheatsheet html content for webview */
    public async getCheatsheetContent(styleKey: string): Promise<string> {
        // Read HTML from file
        const htmlContent = await vscode.workspace.fs
            .readFile(
                vscode.Uri.joinPath(this._cheatsheetUri, 'cheatsheet.html')
            )
            .then((content) => content.toString());

        // Create html document using jsdom to assign new stylesheet
        const htmlDocument = parse(htmlContent);
        const head = htmlDocument.querySelectorAll('head')[0];

        // Remove existing styles
        for (const element of head.querySelectorAll('link')) {
            element.remove();
        }

        // Get uri of stylesheet
        const styleReference = this.getStyleSheetUri(styleKey).toString();

        // Create new style element
        const newStyle = this.getStyleSheetElement(styleReference);

        // Append style element
        // eslint-disable-next-line unicorn/prefer-dom-node-append
        head.appendChild(newStyle);

        // Return document as html string
        return htmlDocument.toString();
    }
}
