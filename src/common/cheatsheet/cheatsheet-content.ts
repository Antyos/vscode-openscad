import { HTMLElement, parse } from 'node-html-parser';
import * as vscode from 'vscode';

import { CheatsheetStyles } from './styles';

/** Get HTML content of the OpenSCAD cheatsheet */
export class CheatsheetContent {
    /** Uri to the directory containing the cheatsheet html and style sheets */
    private readonly _cheatsheetUri: vscode.Uri;
    /** HTMLElement of document */
    private _document?: HTMLElement;
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
    public async getContent(styleKey: string): Promise<string> {
        // Load cheatsheet if it hasn't been loaded yet
        if (this._document === undefined) {
            this._document = await this.getCheatsheetHTML().then((x) => x);
        }

        // If the styleKey hasn't changed, return the stored copy of the document
        if (styleKey === this._lastStyleKey) {
            return this._document.toString();
        }

        // Update lastStyleKey. If we do this inside the next promise, we may
        // create a race condition if two calls to getContent() are made before
        // the promises can be resolved.
        this._lastStyleKey = styleKey;

        // Turn off all stylesheets
        this.disableAllStylesheets();
        this.enableStylesheet(styleKey);

        // Return document content
        return this._document.toString();
    }

    /**
     * Disable all stylesheet links in `this._document`.
     * Returns false if `this._document` is undefined.
     */
    public disableAllStylesheets(): boolean {
        // Return if document is undefined
        if (!this._document) {
            return false;
        }

        // Get the stylesheet links. We need to cast to HTMLLinkElement so we
        // can set the 'disabled' property.
        const stylesheets = this._document.querySelectorAll(
            'link[rel=stylesheet]'
        );

        // Set 'disabled' property of all stylesheets
        for (const style of stylesheets) {
            style.setAttribute('disabled', '');
        }

        return true;
    }

    /**
     * Enable a stylesheet link by id from `this._document`.
     * Returns false if `this._document` is undefined or no stylesheet exists
     * with the passed id.
     */
    public enableStylesheet(id: string): boolean {
        // Return if document is undefined
        if (!this._document) {
            return false;
        }

        // Get link element of stylesheet we want to enable
        const linkElement = this._document.querySelector(
            `link[rel=stylesheet][id=${id}]`
        );

        // Return false if element is undefined
        if (!linkElement) {
            return false;
        }

        // Remove disabled property
        linkElement.removeAttribute('disabled');
        return true;
    }

    public setStylesheet(id: string): boolean {
        return this.disableAllStylesheets() && this.enableStylesheet(id);
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
            media: 'all',
            id: id || '',
        };

        element.setAttributes(attributes);

        return element;
    }

    /** Get the cheatsheet html content for webview */
    private async getCheatsheetHTML(): Promise<HTMLElement> {
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
        return htmlDocument;
    }
}
