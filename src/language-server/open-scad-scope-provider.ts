
import { LangiumDocument, AstNode, AstNodeDescription, AstReflection, getDocument, IndexManager, LangiumServices, Scope, ScopeProvider, stream, Stream, StreamScope, MultiMap, streamContents } from 'langium';
import { Use, Include, ModuleDefinition, FunctionDefinition, VariableDefinition, isPrimary, Primary, Expr, isExpr, isPrimary_Parentheses } from './generated/ast';

export class OpenScadScopeProvider implements ScopeProvider {
    protected readonly reflection: AstReflection;
    protected readonly indexManager: IndexManager;

    constructor(services: LangiumServices) {
        this.reflection = services.shared.AstReflection;
        this.indexManager = services.shared.workspace.IndexManager;
    }

    /**
     * Return the expression containing the given primary if the
     * primary is the single child of the expression.
     * */
    private getExprIfDirect(node: Primary): Expr | undefined {
        let current: AstNode | undefined = node.$container;
        while (current !== undefined) {
            if (streamContents(current).count() > 1)
                return undefined;
            if (isExpr(current)) {
                return current;
            }
            current = current.$container;
        }
        return undefined;
    }

    getScope(node: AstNode, referenceId: string): Scope {
        const scopes: Array<Stream<AstNodeDescription>> = [];
        const referenceType = this.reflection.getReferenceType(referenceId);
        const document = getDocument(node);
        const precomputed = document.precomputedScopes;

        let includeFunctions = false;
        if (referenceType === VariableDefinition && isPrimary(node)) {
            // The node is a variable or function reference from within a primary expression.

            // function references can be nested in parentheses...
            let primary = node;
            while (true) {
                const expr = this.getExprIfDirect(primary);
                if (expr === undefined)
                    break;
                if (isPrimary_Parentheses(expr.$container)) {
                    primary = expr.$container.$container;
                }
                break;
            }

            // Determine if the variable is part of a function call
            //const expr = this.getExpr(node.$container);
            if (primary.$container.call !== undefined) {
                includeFunctions = true;
            }

        }

        if (precomputed) {
            let currentNode: AstNode | undefined = node;
            do {
                const allDescriptions = precomputed.get(currentNode);
                if (allDescriptions.length > 0) {
                    scopes.push(stream(allDescriptions).filter(
                        desc =>
                            this.reflection.isSubtype(desc.type, referenceType)
                            || (includeFunctions && desc.type === FunctionDefinition)
                    ));
                }
                currentNode = currentNode.$container;
            } while (currentNode);
        }

        let result: Scope = this.getGlobalScope(node, document, referenceType);
        for (let i = scopes.length - 1; i >= 0; i--) {
            result = this.createScope(scopes[i], result);
        }
        return result;
    }

    /**
     * Create a scope for the given precomputed stream of elements.
     */
    protected createScope(elements: Stream<AstNodeDescription>, outerScope: Scope): Scope {
        return new StreamScope(elements, outerScope);
    }

    /**
     * Create a global scope filtered for the given reference type.
     */
    protected getGlobalScope(node: AstNode, document: LangiumDocument<AstNode>, referenceType: string): Scope {
        const documentUriString = document.uri.toString();

        const useFiles = new Set<string>(this.indexManager.allElements(Use).filter(x => x.documentUri.toString() === documentUriString).map(x => x.name));

        const includeMap = new MultiMap<string, string>();
        this.indexManager.allElements(Include).forEach(x => includeMap.add(x.documentUri.fsPath, x.name));

        const includeFiles = new Set<string>(document.uri.fsPath);
        {
            const border = [document.uri.fsPath]
            while (border.length > 0) {
                includeMap.get(border.pop()!).filter(x => !includeFiles.has(x)).forEach(x => {
                    includeFiles.add(x);
                    border.push(x);
                });
            }
        }
        return new StreamScope(
            this.indexManager
                .allElements(referenceType)
                .filter(element => {
                    const fsPath = element.documentUri.fsPath;
                    return includeFiles.has(fsPath) || (
                        // only modules and functions are exported using use
                        [ModuleDefinition, FunctionDefinition].indexOf(element.type) != -1
                        && useFiles.has(fsPath));
                }));
    }
}