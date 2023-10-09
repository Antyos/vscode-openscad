// node-html-parser only has appendChild(), not append(); disable the warning.
/* eslint-disable unicorn/prefer-dom-node-append */

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
    /** Content Security Policy */
    private _csp: string;
    private _webview: vscode.Webview;

    public constructor(cheatsheetUri: vscode.Uri, webview: vscode.Webview) {
        this._cheatsheetUri = cheatsheetUri;
        this._cheatsheetStyles = new CheatsheetStyles(cheatsheetUri);
        this._webview = webview;
        this._csp = `default-src 'none'; style-src ${this._webview.cspSource};`;
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
        const element = new HTMLElement(
            'link',
            { id: id ?? '' },
            '',
            // eslint-disable-next-line unicorn/no-null
            null,
            [0, 0]
        );
        const attributes = {
            type: 'text/css',
            rel: 'stylesheet',
            href: href,
            media: 'all',
            id: id ?? '',
        };

        element.setAttributes(attributes);

        return element;
    }

    /**
     * Get a Content-Security-Policy element for the webview
     *
     * See:
     *  - https://code.visualstudio.com/api/extension-guides/webview#content-security-policy
     *  - https://developers.google.com/web/fundamentals/security/csp/
     */
    protected getCSPElement(): HTMLElement {
        // eslint-disable-next-line unicorn/no-null
        const element = new HTMLElement('meta', { id: '' }, '', null, [0, 0]);

        element.setAttributes({
            'http-equiv': 'Content-Security-Policy',
            content: this._csp,
        });

        return element;
    }

    /** Get the cheatsheet html content for webview */
    private async getCheatsheetHTML(): Promise<HTMLElement> {
        // Read and parse HTML from file
        const htmlDocument = await vscode.workspace.fs
            .readFile(
                vscode.Uri.joinPath(this._cheatsheetUri, 'cheatsheet.html')
            )
            .then((uint8array) => {
                const fileContent = new TextDecoder().decode(uint8array);
                // this.loggingService.logDebug(fileContent.toString());
                return parse(fileContent.toString());
            });

        // Get document head
        const head = htmlDocument.querySelector('head');

        // ! FIXME
        if (!head) {
            throw 'No head found';
        }

        // Remove existing css
        for (const element of head.querySelectorAll('link')) {
            element.remove();
        }

        // Add our css
        for (const styleKey of this._cheatsheetStyles) {
            // Get Uri of stylesheet for webview
            const styleUri = this._webview.asWebviewUri(
                this._cheatsheetStyles.styles[styleKey]
            );

            // Create new style element
            const newStyle = this.getStyleSheetElement(
                styleUri.toString(),
                styleKey
            );

            // Append style element
            head.appendChild(newStyle);
        }

        // Add CSP
        head.appendChild(this.getCSPElement());

        // Return document as html string
        return htmlDocument;
    }
}
