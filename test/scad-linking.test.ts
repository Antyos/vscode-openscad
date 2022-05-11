import { stat } from "fs";
import { AstNode, isLinkingError, LangiumDocument, LangiumSharedServices, streamAllContents, streamReferences } from "langium";
import { Assignment, BlockStatement, FunctionDefinition, Input, ModuleDefinition, ModuleInstantiation, SingleModuleInstantiation, VariableDefinition } from "../src/language-server/generated/ast";
import { createScadServices, ScadServices } from "../src/language-server/scad-module";
import { parseHelper } from "./util";

class DocumentStats {
    refCount: number = 0;
    refNotFound: number = 0;
}

async function build<T extends { [key: string]: string }>(docs: T): Promise<{
    docs: { [key in keyof (T)]: LangiumDocument<AstNode> }, shared: LangiumSharedServices,
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

test("Module", async () => {
    const { docs: { doc }, Scad } = await build({ doc: 'module foo(a,b) {sphere(a);} foo(b=2);' });
    const input = doc.parseResult.value as Input;
    const moduleDefinition = input.statements[0] as ModuleDefinition;
    const moduleInstantiation = (input.statements[1] as ModuleInstantiation).module!;
    const paramA = moduleDefinition.params.params[1].def;
    const paramB = moduleDefinition.params.params[1].def;
    expect(paramB === moduleInstantiation.args.args[0].param!.ref).toBeTruthy();
    expect(Scad.references.References.findReferences(paramA).count()).toBe(1);
});

['function foo(a,b) =a*2; x=foo(b=2);', 'function foo(a,b) =a*2; x=(foo)(b=2);'].forEach(docText =>
    test("Function " + docText, async () => {
        const { docs: { doc }, Scad } = await build({ doc: docText });
        const input = doc.parseResult.value as Input;
        const func = input.statements[0] as FunctionDefinition;
        expect(Scad.references.References.findReferences(func).count()).toBe(1);
        expect(Scad.references.References.findReferences(func.params.params[0].def).count()).toBe(1);
        expect(Scad.references.References.findReferences(func.params.params[1].def).count()).toBe(1);
    }));

test("Variable linked", async () => {
    const { stats } = await build({ doc: "a=1; b=a+1;" });
    expect(stats.doc.refCount).toBe(1);
    expect(stats.doc.refNotFound).toBe(0);
});

test("Unknow variable not linked", async () => {
    const { stats } = await build({ doc: "a=1; b=c+1;" });
    expect(stats.doc.refCount).toBe(1);
    expect(stats.doc.refNotFound).toBe(1);
});

test("echo plain", async () => {
    const { stats } = await build({ doc: "echo(1);" });
});

test("echo not linked", async () => {
    const { stats } = await build({ doc: "a=1; echo(a=1);" });
    expect(stats.doc.refCount).toBe(0);
});