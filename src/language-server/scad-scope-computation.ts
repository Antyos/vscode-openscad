import { AstNode, AstNodeDescription, DefaultScopeComputation, isAssignment, LangiumDocument, MultiMap, PrecomputedScopes } from 'langium';
import { CancellationToken } from 'vscode-jsonrpc';
import { Assignment, ScadAstType, ModuleDefinition, FunctionDefinition, BlockStatement, Expr_InlineFunctionDefinition, VariableDefinition, Parameters, Expr_Let, ParameterDefinition, isModuleDefinition, isFunctionDefinition, isExpr_InlineFunctionDefinition, isExpr_Let, isExpr_LetFirst } from './generated/ast';

function assertNever(arg: never) {
    throw "This should never be reached: " + arg;
}
export class ScadScopeComputation extends DefaultScopeComputation {

    override async computeScope(document: LangiumDocument, cancelToken = CancellationToken.None): Promise<PrecomputedScopes> {
        const scopes = await super.computeScope(document, cancelToken);
        const result = new MultiMap<AstNode, AstNodeDescription>();
        // move scope of nested blocks up
        scopes.keys().forEach(node => {
            let target = node;
            // move definitions of nested block statements up
            if (node.$type == BlockStatement) {
                while (target.$container?.$type === BlockStatement) {
                    target = target.$container;
                }
            }
            result.addAll(target, scopes.get(node));
        });
        return result;
    }


    protected override processNode(node: AstNode, document: LangiumDocument, scopes: PrecomputedScopes): void {
        switch (node.$type as ScadAstType) {
            case 'VariableDefinition': {
                // variable definitions are added to their container
                const varDef = node as VariableDefinition;
                const desc = this.descriptions.createDescription(varDef, varDef.name, document);
                if (isAssignment(varDef.$container)) {
                    const assignment = varDef.$container;
                    scopes.add(assignment.$container, desc);
                }
                else if (isExpr_Let(varDef.$container) || isExpr_LetFirst(varDef.$container)) {
                    scopes.add(varDef.$container.inner!, desc);
                }
                else
                    throw "should not happen";
            }
                return;
            case 'ParameterDefinition':
                {
                    // attach the parameters of modules and functions as variable definitions to their bodies
                    const paramDef = node as ParameterDefinition;
                    const container = paramDef.$container.$container.$container;
                    const desc = this.descriptions.createDescription(paramDef, paramDef.name, document);
                    desc.type = VariableDefinition;
                    if (isModuleDefinition(container)) {
                        scopes.add(container.body, desc);
                    }
                    else if (isFunctionDefinition(container)) {
                        scopes.add(container.expr, desc);
                    } else if (isExpr_InlineFunctionDefinition(container)) {
                        scopes.add(container.expr, desc);
                    } else
                        throw "should not happen";
                }
                return;
        }
        super.processNode(node, document, scopes);
    }
}