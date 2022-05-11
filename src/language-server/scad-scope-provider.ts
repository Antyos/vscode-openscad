
import { LangiumDocument, AstNode, AstNodeDescription, AstReflection, getDocument, IndexManager, LangiumServices, Scope, ScopeProvider, stream, Stream, StreamScope, MultiMap, streamContents, EMPTY_SCOPE, AstNodeDescriptionProvider } from 'langium';
import { resolve } from 'path';
import { isFunctionDefinition, Use, Include, ModuleDefinition, FunctionDefinition, VariableDefinition, isPrimary, Primary, Expr, isExpr, isPrimary_Parentheses, ParameterDefinition, isArgument, isCall_Function, isSingleModuleInstantiation, isListComprehensionElement_For } from './generated/ast';

export class ScadScopeProvider implements ScopeProvider {
    protected readonly reflection: AstReflection;
    protected readonly indexManager: IndexManager;
    protected readonly descriptionProvider: AstNodeDescriptionProvider;

    constructor(private extensionPath: string | undefined, services: LangiumServices) {
        this.reflection = services.shared.AstReflection;
        this.indexManager = services.shared.workspace.IndexManager;
        this.descriptionProvider = services.index.AstNodeDescriptionProvider;
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

    private getPrimaryIfDirect(node: Expr): Primary | undefined {
        let current: AstNode | undefined = node;
        while (current !== undefined) {
            if (isPrimary(current)) {
                return current;
            }

            const contents = streamContents(current).toArray();
            if (contents.length !== 1)
                return undefined;

            current = contents[0];
        }
        return undefined;
    }

    getScope(node: AstNode, referenceId: string): Scope {
        const scopes: Array<Stream<AstNodeDescription>> = [];
        const referenceType = this.reflection.getReferenceType(referenceId);
        const document = getDocument(node);
        const precomputed = document.precomputedScopes;


        if (referenceType === ParameterDefinition && isArgument(node)) {
            if (precomputed === undefined) {
                return EMPTY_SCOPE;
            }
            // parameter definitions are a separate story

            // search the corresponding module or function
            const c = node.$container.$container;
            if (isCall_Function(c)) {
                // determine called function
                let primary = c.$container.target;
                while (primary.paren !== undefined) {
                    const tmp = this.getPrimaryIfDirect(primary.paren.expr);
                    if (tmp === undefined)
                        return EMPTY_SCOPE;
                    primary = tmp;
                }
                const variable = primary.var;
                if (variable === undefined)
                    return EMPTY_SCOPE;
                const func = variable.ref;
                if (func === undefined || !isFunctionDefinition(func)) {
                    return EMPTY_SCOPE;
                }
                // return parameter definitions of function
                return new StreamScope(stream(func.params.params.map(p => this.descriptionProvider.createDescription(p.def, p.def.name))));
            }
            else if (isSingleModuleInstantiation(c)) {
                // determine the module
                if (c.id.id?.ref !== undefined) {
                    const module = c.id.id.ref;
                    if (module === undefined)
                        return EMPTY_SCOPE;

                    return new StreamScope(stream(module.params.params.map(p => this.descriptionProvider.createDescription(p.def, p.def.name))));
                }
            }
            else if (isListComprehensionElement_For(c)) {
                // TODO
            }
            else throw 'Not Supported: ' + (c as any).$type;

            // extract from the parameters


        }

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

        const referenceTypes = [referenceType, ...includeFunctions ? [FunctionDefinition] : []];

        if (precomputed) {
            let currentNode: AstNode | undefined = node;
            do {
                const allDescriptions = precomputed.get(currentNode);
                if (allDescriptions.length > 0) {
                    scopes.push(stream(allDescriptions).filter(
                        desc => referenceTypes.some(referenceType => this.reflection.isSubtype(desc.type, referenceType))
                    ));
                }
                currentNode = currentNode.$container;
            } while (currentNode);
        }

        const builtinScope = this.createBuiltinScope(referenceTypes);

        let result: Scope = this.getGlobalScope(node, document, referenceTypes, builtinScope);
        for (let i = scopes.length - 1; i >= 0; i--) {
            result = this.createScope(scopes[i], result);
        }
        return result;
    }

    private flatMap<T, R>(array: T[], f: (item: T) => Stream<R>): R[] {
        const result: R[] = [];
        array.forEach(item => f(item).forEach(r => result.push(r)));
        return result;
    }

    private createBuiltinScope(referenceTypes: string[]): Scope {
        const extensionPath = this.extensionPath;
        if (extensionPath === undefined)
            return EMPTY_SCOPE;
        return new StreamScope(
            stream(referenceTypes)
                .flatMap(referenceType => this.indexManager.allElements(referenceType))
                .filter(x => x.documentUri.fsPath.startsWith(resolve(extensionPath, 'builtin'))));
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
    protected getGlobalScope(node: AstNode, document: LangiumDocument<AstNode>, referenceTypes: string[], builtinScope: Scope): Scope {
        const documentUriString = document.uri.toString();

        const useFiles = new Set<string>(this.indexManager.allElements(Use).filter(x => x.documentUri.toString() === documentUriString).map(x => x.name));

        const includeMap = new MultiMap<string, string>();
        this.indexManager.allElements(Include).forEach(x => includeMap.add(x.documentUri.fsPath, x.name));

        const includeFiles = new Set<string>([document.uri.fsPath]);
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
            stream(referenceTypes)
                .flatMap(referenceType => this.indexManager.allElements(referenceType))
                .filter(element => {
                    const fsPath = element.documentUri.fsPath;
                    return includeFiles.has(fsPath) || (
                        // only modules and functions are exported using use
                        [ModuleDefinition, FunctionDefinition].indexOf(element.type) != -1
                        && useFiles.has(fsPath));
                }), builtinScope);
    }
}