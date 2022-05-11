import { Assignment, FunctionDefinition, ModuleDefinition, VariableDefinition } from "../src/language-server/generated/ast";
import { createScadServices } from "../src/language-server/scad-module";
import { parseHelper } from "./util";

const { shared, Scad } = createScadServices(undefined);
const parse = parseHelper(Scad);
const parseScope = async (input: string) => {
    const document = await parse(input);
    const scope = await Scad.references.ScopeComputation.computeScope(document);
    return { input: document.parseResult.value, scope };
}
test('module registered with input', async () => {
    const { input, scope } = await parseScope('module foo();');

    const inputScope = scope.get(input);
    expect(inputScope.length).toBe(1);
    expect(inputScope[0].type).toBe(ModuleDefinition);
    expect(inputScope[0].name).toBe("foo");
});

test('variable defined in input', async () => {
    const { input, scope } = await parseScope('a=1;');
    const inputScope = scope.get(input);
    expect(inputScope.length).toBe(1);
    expect(inputScope[0].type).toBe(VariableDefinition);
    expect(inputScope[0].name).toBe("a");
});
test('variable defined in let', async () => {
    const { input, scope } = await parseScope('var=let (a=1, b=2*a) b;');
    const exprLet = (input.statements[0] as Assignment).exp.let!;
    let exprScope = scope.get(exprLet.inner!);
    expect(exprScope.length).toBe(1);
    expect(exprScope[0].type).toBe(VariableDefinition);
    expect(exprScope[0].name).toBe("a");
    exprScope = scope.get(exprLet.inner!.inner!);
    expect(exprScope.length).toBe(1);
    expect(exprScope[0].type).toBe(VariableDefinition);
    expect(exprScope[0].name).toBe("b");
});

test('parameter registered as variable in body of module', async () => {
    const { input, scope } = await parseScope('module foo(a);');
    const body = (input.statements[0] as ModuleDefinition).body
    const bodyScope = scope.get(body);
    expect(bodyScope.length).toBe(1);
    expect(bodyScope[0].type).toBe(VariableDefinition);
    expect(bodyScope[0].name).toBe("a");
});

test('parameter registered as variable in body of function', async () => {
    const { input, scope } = await parseScope('function foo(a)=a;');
    const body = (input.statements[0] as FunctionDefinition).expr
    const bodyScope = scope.get(body);
    expect(bodyScope.length).toBe(1);
    expect(bodyScope[0].type).toBe(VariableDefinition);
    expect(bodyScope[0].name).toBe("a");
});
test('parameter registered as variable in body of inline function', async () => {
    const { input, scope } = await parseScope('x=function (a) a*a;');
    const body = (input.statements[0] as Assignment).exp.inline!.expr;
    const bodyScope = scope.get(body);
    expect(bodyScope.length).toBe(1);
    expect(bodyScope[0].type).toBe(VariableDefinition);
    expect(bodyScope[0].name).toBe("a");
});