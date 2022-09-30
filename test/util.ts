import { URI } from 'vscode-uri';
import { AstNode, LangiumDocument, LangiumSharedServices, streamAllContents, streamReferences } from "langium";
import { Input } from "../src/language-server/generated/ast";
import { createScadServices, ScadServices } from "../src/language-server/scad-module";

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

export class DocumentStats {
    refCount: number = 0;
    refNotFound: number = 0;
}

export async function processDocs<T extends { [key: string]: string }>(docs: T): Promise<{
    docs: { [key in keyof (T)]: LangiumDocument<Input> }, shared: LangiumSharedServices,
    Scad: ScadServices, stats: { [key in keyof (T)]: DocumentStats }
}> {
    const { shared, Scad } = createScadServices(undefined);
    const parse = parseHelper(Scad);
    const result: { [key: string]: LangiumDocument<AstNode> } = {};
    for (const [key, value] of Object.entries(docs)) {
        result[key] = await parse(value);
    }
    await shared.workspace.DocumentBuilder.build(Object.values(result));
    const stats: any = {};
    for (const [key, value] of Object.entries(result)) {
        const stat = new DocumentStats();
        streamAllContents(value.parseResult.value).flatMap(n => streamReferences(n))
            .forEach(ref => {
                stat.refCount++;
                if (ref.reference.ref === undefined) {
                    stat.refNotFound++;
                }
            });
        stats[key] = stat;
    }

    return { docs: result as any, shared, Scad, stats: stats as any };
}
