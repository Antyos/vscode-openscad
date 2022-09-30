import { AstNode, DefaultFoldingRangeProvider } from "langium";
import { isBlockStatement, isExpr, isModuleDefinition, isModuleInstantiation } from "./generated/ast";

export class ScadFoldingRangeProvider extends DefaultFoldingRangeProvider {

    protected override shouldProcessContent(node: AstNode): boolean {
        if (isExpr(node))
            return false;
        return true;
    }

    protected override shouldProcess(node: AstNode): boolean {
        return isModuleInstantiation(node) || isModuleDefinition(node) || isBlockStatement(node);
    }
}