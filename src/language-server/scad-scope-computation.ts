import { AstNode, AstNodeDescription, DefaultScopeComputation, LangiumDocument, MultiMap, PrecomputedScopes } from 'langium';
import { CancellationToken } from 'vscode-jsonrpc';
import { Assignment, ScadAstType, ModuleDefinition, FunctionDefinition, BlockStatement, Expr_InlineFunctionDefinition } from './generated/ast';

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
            case 'VariableDefinition':
                // variable Definitions are handled by the containing nodes
                return;

            case 'ModuleDefinition':
            case 'FunctionDefinition':
            case 'Expr_InlineFunctionDefinition':
                {
                    // attach the parameters of modules and functions
                    const definition = node as ModuleDefinition | FunctionDefinition | Expr_InlineFunctionDefinition;
                    definition.params?.params?.forEach(p =>
                        scopes.add(definition, this.descriptions.createDescription(p.var, p.var.name, document)));
                }
                break;

            case 'Assignment':
                {
                    // the variable definition of assignments are attached to the container
                    const assignment = node as Assignment;
                    scopes.add(node.$container!, this.descriptions.createDescription(assignment.var, assignment.var.name, document));
                }
                break;

            default:
        }
        super.processNode(node, document, scopes);
    }
}