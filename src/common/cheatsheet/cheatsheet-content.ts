import { HTMLElement, parse } from 'node-html-parser';
import * as vscode from 'vscode';
import { CheatsheetStyles } from './styles';

/** Get HTML content of the OpenSCAD cheatsheet */
export class CheatsheetContent {
    /** Uri to the directory containing the cheatsheet html and style sheets */
    private readonly _cheatsheetUri: vscode.Uri;
    /** HTMLElement of document */
    private _document?: HTMLElement;
    /** Stored copy of the cheatsheet HTML document */
    private _content?: string = undefined;
    /** The last key used to get the cheatsheet stylesheet */
    private _lastStyleKey?: string = undefined;
    /** Styles container */
    private _cheatsheetStyles: CheatsheetStyles;

    public constructor(cheatsheetUri: vscode.Uri) {
        this._cheatsheetUri = cheatsheetUri;

        // ! This is WRONG. We need extensionUri, but I'm lazy right now.
        this._cheatsheetStyles = new CheatsheetStyles(cheatsheetUri);
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

    /**
     * Get a <link> HTMLElement for a stylesheet.
     * @param {string} href Reference to stylesheet
     * @param {string | undefined} id of element
     * @returns HTMLElement
     */
    private getStyleSheetElement(href: string, id?: string): HTMLElement {
        // HTMLElement `parent` argument cannot be type 'undefined', so we have
        // to disable the check here
        // eslint-disable-next-line unicorn/no-null
        const element = new HTMLElement('link', { id: id || '' }, '', null);
        const attributes = {
            type: 'text/css',
            rel: 'stylesheet',
            href: href,
            media: 'none', // We will turn on specific stylesheets later
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

        for (const styleKey of this._cheatsheetStyles) {
            // Create new style element
            const newStyle = this.getStyleSheetElement(
                this._cheatsheetStyles.styles[styleKey].toString(),
                styleKey
            );

            // Append style element
            // eslint-disable-next-line unicorn/prefer-dom-node-append
            head.appendChild(newStyle);
        }

        // Return document as html string
        return htmlDocument.toString();
    }
}
