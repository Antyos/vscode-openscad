import { LangiumDocument } from "langium";
import { Input } from "../src/language-server/generated/ast";
import { ScadServices } from "../src/language-server/scad-module";
import { URI } from 'vscode-uri';

export function parseHelper(services: ScadServices): (input: string) => Promise<LangiumDocument<Input>> {
    const metaData = services.LanguageMetaData;
    const documentBuilder = services.shared.workspace.DocumentBuilder;

    return async input => {
        const randomNumber = Math.floor(Math.random() * 10000000) + 1000000;
        const uri = URI.parse(`file:///${randomNumber}${metaData.fileExtensions[0]}`);
        const document = services.shared.workspace.LangiumDocumentFactory.fromString<Input>(input, uri);
        expect(document.parseResult.lexerErrors).toHaveLength(0);
        expect(document.parseResult.parserErrors).toHaveLength(0);
        return document;
    };
}