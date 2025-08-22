import * as vscode from 'vscode';
import { OpenScadDataManager } from './data-manager';
import * as path from 'path';

export class OpenScadVFSProvider implements vscode.FileSystemProvider {
	private _onDidChangeFile = new vscode.EventEmitter<vscode.FileChangeEvent[]>();
	readonly onDidChangeFile: vscode.Event<vscode.FileChangeEvent[]> = this._onDidChangeFile.event;
	private dataManager: OpenScadDataManager;

	constructor(dataManager: OpenScadDataManager) {
		this.dataManager = dataManager;
	}

	private parseUri(uri: vscode.Uri): { scadFileUri: vscode.Uri, virtualFileName: string } {
		// Example: openscad-debug:///absolute/path/to/file.scad/model.stl
		const parts = uri.path.split('/');
		const virtualFileName = parts.pop()!;
		const scadFilePath = parts.join('/');
		const scadFileUri = vscode.Uri.file(scadFilePath);
		return { scadFileUri, virtualFileName };
	}

	async readFile(uri: vscode.Uri): Promise<Uint8Array> {
		const { scadFileUri, virtualFileName } = this.parseUri(uri);

		switch (virtualFileName) {
			// New Eager Files
			case 'render.log': {
				const logs = this.dataManager.getLogs(scadFileUri);
				return Uint8Array.from(Buffer.from(logs.stdout));
			}
			case 'error.log': {
				const errorLogs = this.dataManager.getLogs(scadFileUri);
				return Uint8Array.from(Buffer.from(errorLogs.stderr));
			}
			case 'model.stl': {
				const stl = this.dataManager.getSTL(scadFileUri);
				if (!stl) throw vscode.FileSystemError.FileNotFound('STL not compiled yet. Save the file to trigger a compile.');
				return Uint8Array.from(stl);
			}
			// Lazy Files (unchanged)
			case 'dimensions.json': {
				const dims = await this.dataManager.getDimensions(scadFileUri);
				return Uint8Array.from(Buffer.from(JSON.stringify(dims, null, 2)));
			}
			case 'scene-graph.csg': {
				const buf = await this.dataManager.getSceneGraph(scadFileUri);
				return Uint8Array.from(buf);
			}
			case 'preview.png': {
				const buf = await this.dataManager.getPreview(scadFileUri);
				return Uint8Array.from(buf);
			}
			default:
				throw vscode.FileSystemError.FileNotFound(uri);
		}
	}
	createDirectory(uri: vscode.Uri): void | Thenable<void> {
		throw vscode.FileSystemError.NoPermissions('Read-only VFS');
	}

	readDirectory(uri: vscode.Uri): [string, vscode.FileType][] {
		return [
			// New
			['render.log', vscode.FileType.File],
			['error.log', vscode.FileType.File],
			['model.stl', vscode.FileType.File],
			// Existing
			['dimensions.json', vscode.FileType.File],
			['scene-graph.csg', vscode.FileType.File],
			['preview.png', vscode.FileType.File],
			['highlight.action', vscode.FileType.File],
		];
	}

	// Minimal stubs for required FileSystemProvider methods
	stat(uri: vscode.Uri): vscode.FileStat {
		return { type: vscode.FileType.File, ctime: 0, mtime: 0, size: 0 };
	}
	watch(uri: vscode.Uri, options: { recursive: boolean; excludes: string[]; }): vscode.Disposable {
		return new vscode.Disposable(() => {});
	}
	writeFile(uri: vscode.Uri, content: Uint8Array, options: { create: boolean; overwrite: boolean; }): void | Thenable<void> {
		throw vscode.FileSystemError.NoPermissions('Read-only VFS');
	}
	delete(uri: vscode.Uri, options: { recursive: boolean; }): void | Thenable<void> {
		throw vscode.FileSystemError.NoPermissions('Read-only VFS');
	}
	rename(oldUri: vscode.Uri, newUri: vscode.Uri, options: { overwrite: boolean; }): void | Thenable<void> {
		throw vscode.FileSystemError.NoPermissions('Read-only VFS');
	}
}
