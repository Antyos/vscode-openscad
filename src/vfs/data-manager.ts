import * as vscode from 'vscode';
import { Compiler } from '@bascanada/openscad-compiler';

class ScadDocumentData {
	public stdout: string = '';
	public stderr: string = '';
	public stl: Buffer | null = null;
	public dimensions: any | null = null;
	public sceneGraph: Buffer | null = null;
	public preview: Buffer | null = null;
}

export class OpenScadDataManager {
	private compiler: Compiler;
	private documentCache = new Map<string, ScadDocumentData>();

	constructor() {
		this.compiler = new Compiler({ engine: 'native' });
	}

	private async getScadContent(uri: vscode.Uri): Promise<string> {
		const content = await vscode.workspace.fs.readFile(uri);
		return Buffer.from(content).toString('utf8');
	}

	private getOrCreateData(uri: vscode.Uri): ScadDocumentData {
		if (!this.documentCache.has(uri.toString())) {
			this.documentCache.set(uri.toString(), new ScadDocumentData());
		}
		return this.documentCache.get(uri.toString())!;
	}

	// EAGER: Called on file save to get the most common data.
	public async triggerCompilation(scadFileUri: vscode.Uri): Promise<void> {
		const data = this.getOrCreateData(scadFileUri);
		const scadCode = await this.getScadContent(scadFileUri);

		// Reset logs for this run
		data.stdout = '';
		data.stderr = '';

		const emitter = this.compiler.compile(scadCode, 'fast');

	    emitter.on('stdout', (chunk: string) => { data.stdout += chunk; });
	    emitter.on('stderr', (chunk: string) => { data.stderr += chunk; });

		return new Promise<void>((resolve, reject) => {
			emitter.on('done', (stlOutput: Buffer | string) => {
				data.stl = Buffer.isBuffer(stlOutput) ? stlOutput : Buffer.from(stlOutput);
				resolve();
			});
			emitter.on('error', (error: Error) => reject(error));
		});
	}

	// LAZY: Get dimensions, using cached STL if available.
	public async getDimensions(scadFileUri: vscode.Uri): Promise<any> {
		const data = this.getOrCreateData(scadFileUri);
		if (data.dimensions) return data.dimensions; // Return from cache

		if (!data.stl) { // Ensure STL is compiled if not already
			await this.triggerCompilation(scadFileUri);
		}
		// Now that we're sure data.stl exists, we can call the compiler's helper
		const scadCode = await this.getScadContent(scadFileUri);
		data.dimensions = await this.compiler.getDimensions(scadCode);
		return data.dimensions;
	}

	// LAZY: Getters for other data types
	public async getSceneGraph(scadFileUri: vscode.Uri): Promise<Buffer> {
		const data = this.getOrCreateData(scadFileUri);
		if (data.sceneGraph) return data.sceneGraph;
		const scadCode = await this.getScadContent(scadFileUri);
		data.sceneGraph = await this.compiler.getSceneGraph(scadCode);
		return data.sceneGraph;
	}

	public async getPreview(scadFileUri: vscode.Uri): Promise<Buffer> {
		const data = this.getOrCreateData(scadFileUri);
		if (data.preview) return data.preview;
		const scadCode = await this.getScadContent(scadFileUri);
		data.preview = await this.compiler.getPreview(scadCode);
		return data.preview;
	}

	// GETTERS FOR EAGER DATA
	public getLogs(scadFileUri: vscode.Uri): { stdout: string, stderr: string } {
		const data = this.getOrCreateData(scadFileUri);
		return { stdout: data.stdout, stderr: data.stderr };
	}

	public getSTL(scadFileUri: vscode.Uri): Buffer | null {
		return this.getOrCreateData(scadFileUri).stl;
	}
}
