import { DefaultWorkspaceManager, LangiumDocument, LangiumSharedServices } from "langium";
import { resolve } from "path";
import { WorkspaceFolder } from "vscode-languageclient";
import { URI } from 'vscode-uri';

export default class ScadWorkspaceManager extends DefaultWorkspaceManager {
    constructor(services: LangiumSharedServices, private extensionPath: string | undefined) {
        super(services);
    }
    protected override async loadAdditionalDocuments(folders: WorkspaceFolder[], collector: (document: LangiumDocument) => void): Promise<void> {
        if (this.extensionPath === undefined)
            return;
        for (const fileName of ['functions.scad', 'modules.scad']) {
            const path = resolve(this.extensionPath, 'builtin', fileName);
            collector(this.langiumDocuments.getOrCreateDocument(URI.file(path)));
        }
    }
}