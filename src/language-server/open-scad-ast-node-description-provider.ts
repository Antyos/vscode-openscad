import { AstNode, AstNodeDescription, DefaultAstNodeDescriptionProvider, LangiumDocument, streamAllContents } from "langium";
import { dirname, resolve } from "path";
import { CancellationToken } from "vscode";
import { isInclude, isUse, isInput, isAssignment } from "./generated/ast";

export default class OpenScadAstNodeDescriptionProvider extends DefaultAstNodeDescriptionProvider {
    override async createDescriptions(document: LangiumDocument<AstNode>, cancelToken?: CancellationToken): Promise<AstNodeDescription[]> {
        const descr = await super.createDescriptions(document, cancelToken);
        const rootNode = document.parseResult.value;

        // in addition, export all use or include nodes to the global scope
        for (const node of streamAllContents(rootNode)) {
            if (isUse(node) || isInclude(node)) {
                const path = resolve(dirname(document.uri.fsPath), node.file.substring(1, node.file.length - 1));
                descr.push(this.createDescription(node, path, document))
            }
            if (isAssignment(node) && isInput(node.$container)) {
                descr.push(this.createDescription(node.var, node.var.name, document));
            }
        }
        return descr;
    }
}