import { DefaultWorkspaceManager, LangiumDocument, LangiumSharedServices } from "langium";
import { resolve } from "path";
import { WorkspaceFolder } from "vscode-languageclient";
import { URI } from 'vscode-uri';

export default class ScadWorkspaceManager extends DefaultWorkspaceManager {
    constructor(private extensionPath: string, services: LangiumSharedServices) {
        super(services);
    }
    protected override async loadAdditionalDocuments(folders: WorkspaceFolder[], collector: (document: LangiumDocument) => void): Promise<void> {
        for (const fileName of ['functions.scad', 'modules.scad']) {
            const path = resolve(this.extensionPath, 'builtin', fileName);
            collector(this.langiumDocuments.getOrCreateDocument(URI.file(path)));
        }
    }
}