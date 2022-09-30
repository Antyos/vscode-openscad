import { FunctionDefinition, Input, ModuleDefinition, ModuleInstantiation } from "../src/language-server/generated/ast";
import { processDocs } from "./util";

test("Module", async () => {
    const { docs: { doc }, Scad } = await processDocs({ doc: 'module foo(a,b) {sphere(a);} foo(b=2);' });
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
        const { docs: { doc }, Scad } = await processDocs({ doc: docText });
        const input = doc.parseResult.value as Input;
        const func = input.statements[0] as FunctionDefinition;
        expect(Scad.references.References.findReferences(func).count()).toBe(1);
        expect(Scad.references.References.findReferences(func.params.params[0].def).count()).toBe(1);
        expect(Scad.references.References.findReferences(func.params.params[1].def).count()).toBe(1);
    }));

test("Variable linked", async () => {
    const { stats } = await processDocs({ doc: "a=1; b=a+1;" });
    expect(stats.doc.refCount).toBe(1);
    expect(stats.doc.refNotFound).toBe(0);
});

test("Unknow variable not linked", async () => {
    const { stats } = await processDocs({ doc: "a=1; b=c+1;" });
    expect(stats.doc.refCount).toBe(1);
    expect(stats.doc.refNotFound).toBe(1);
});

test("echo plain", async () => {
    const { stats } = await processDocs({ doc: "echo(1);" });
});

test("echo not linked", async () => {
    const { stats } = await processDocs({ doc: "a=1; echo(a=1);" });
    expect(stats.doc.refCount).toBe(0);
});