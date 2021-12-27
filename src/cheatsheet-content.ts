import { HTMLElement, parse } from 'node-html-parser';
import * as vscode from 'vscode';

/** Cheatsheet color schemes. Located in `[extensionPath]/media/` */
const colorScheme = {
    original: 'cheatsheet-original.css',
    auto: 'cheatsheet-auto.css',
};

/** Get HTML content of the OpenSCAD cheatsheet */
export class CheatsheetContent {
    /** Uri to the directory containing the cheatsheet html and style sheets */
    private readonly _cheatsheetUri: vscode.Uri;

    public constructor(cheatsheetUri: vscode.Uri) {
        this._cheatsheetUri = cheatsheetUri;
    }

    /** Get the file URI to the style sheet */
    private getStyleSheetUri(styleKey: string): vscode.Uri {
        // Get the filename of the given colorScheme
        // Thank you: https://blog.smartlogic.io/accessing-object-attributes-based-on-a-variable-in-typescript/
        const styleSource =
            styleKey in colorScheme
                ? colorScheme[styleKey as keyof typeof colorScheme]
                : colorScheme['auto'];

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
    public async getWebviewContent(styleKey: string): Promise<string> {
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
