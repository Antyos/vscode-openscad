import { AstNode, AstNodeDescription, CompletionAcceptor, DefaultCompletionProvider, isAstNode, isNamed, Keyword } from "langium";
import { CompletionItem, CompletionItemKind } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { ModuleDefinition } from "./generated/ast";

export class OpenScadCompletionProvider extends DefaultCompletionProvider {
    protected override   completionForKeyword(keyword: Keyword, context: AstNode | undefined, acceptor: CompletionAcceptor): void {
        return;
        // super.completionForKeyword(keyword, context, acceptor);
    }

    protected override  fillCompletionItem(document: TextDocument, offset: number, value: string | AstNode | AstNodeDescription, info: Partial<CompletionItem> | undefined): CompletionItem | undefined {
        let label: string;
        let textInsertion: string | undefined = undefined;

        if (typeof value === 'string') {
            label = value;
        } else if (isAstNode(value) && isNamed(value)) {
            label = value.name;
        } else if (!isAstNode(value)) {
            label = value.name;
            if (info?.kind === CompletionItemKind.Reference && value.type === ModuleDefinition) {
                textInsertion = value.name + "(";
            }

        } else {
            return undefined;
        }

        if (textInsertion === undefined)
            textInsertion = label;

        const textEdit = this.buildCompletionTextEdit(document, offset, textInsertion);
        if (!textEdit) {
            return undefined;
        }
        const item: CompletionItem = { label, textEdit };
        if (info) {
            Object.assign(item, info);
        }
        return item;
    }
}