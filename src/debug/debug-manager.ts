import * as vscode from 'vscode';
import * as path from 'path';
import { Compiler } from '@bascanada/openscad-compiler';

export class DebugFileManager {
    private compiler: Compiler;

    constructor(private workspaceRoot: vscode.Uri) {
        this.compiler = new Compiler({ engine: 'native' });
    }

    private getDebugDirFor(scadFileUri: vscode.Uri): vscode.Uri {
        const relativePath = path.relative(this.workspaceRoot.fsPath, scadFileUri.fsPath);
        // Place debug files under .openscad/debug/<relativePath>/
        const debugDirPath = path.join(this.workspaceRoot.fsPath, '.openscad', 'debug', relativePath);
        return vscode.Uri.file(debugDirPath);
    }

    // This single method generates and writes all debug files.
    public async updateAllDebugFiles(scadFileUri: vscode.Uri): Promise<void> {
        const debugDir = this.getDebugDirFor(scadFileUri);
        // ensure directory
        await vscode.workspace.fs.createDirectory(debugDir);

        const raw = await vscode.workspace.fs.readFile(scadFileUri);
        const scadCode = Buffer.from(raw).toString('utf8');

        // Generate all data in parallel
        const [dimensions, sceneGraph, preview, stlResult] = await Promise.all([
            this.compiler.getDimensions(scadCode),
            this.compiler.getSceneGraph(scadCode),
            this.compiler.getPreview(scadCode),
            this.runStlCompilation(scadCode)
        ]);

        // Prepare Uint8Array-encoded payloads
        const encoder = new TextEncoder();
        const dimensionsBytes = encoder.encode(JSON.stringify(dimensions, null, 2));

        const sceneGraphBytes = ((): Uint8Array => {
            if (typeof sceneGraph === 'string') return encoder.encode(sceneGraph);
            if (Buffer.isBuffer(sceneGraph)) return Uint8Array.from(sceneGraph);
            return encoder.encode(String(sceneGraph));
        })();

        const previewBytes = ((): Uint8Array => {
            if (typeof preview === 'string') return encoder.encode(preview);
            if (Buffer.isBuffer(preview)) return Uint8Array.from(preview);
            return encoder.encode(String(preview));
        })();

        const stlBytes = Buffer.isBuffer(stlResult.stl) ? Uint8Array.from(stlResult.stl) : encoder.encode(String(stlResult.stl));
        const stdoutBytes = encoder.encode(stlResult.stdout || '');
        const stderrBytes = encoder.encode(stlResult.stderr || '');

        // Write all files
        await Promise.all([
            vscode.workspace.fs.writeFile(vscode.Uri.joinPath(debugDir, 'dimensions.json'), dimensionsBytes),
            vscode.workspace.fs.writeFile(vscode.Uri.joinPath(debugDir, 'scene-graph.csg'), sceneGraphBytes),
            vscode.workspace.fs.writeFile(vscode.Uri.joinPath(debugDir, 'preview.png'), previewBytes),
            vscode.workspace.fs.writeFile(vscode.Uri.joinPath(debugDir, 'model.stl'), stlBytes),
            vscode.workspace.fs.writeFile(vscode.Uri.joinPath(debugDir, 'render.log'), stdoutBytes),
            vscode.workspace.fs.writeFile(vscode.Uri.joinPath(debugDir, 'error.log'), stderrBytes),
        ]);
    }

    private runStlCompilation(scadCode: string): Promise<{ stl: Buffer, stdout: string, stderr: string }> {
        return new Promise((resolve, reject) => {
            let stdout = '', stderr = '';
            const emitter = this.compiler.compile(scadCode);
            emitter.on('stdout', (c: string) => stdout += c);
            emitter.on('stderr', (c: string) => stderr += c);
            emitter.on('done', (stl: Buffer | string) => resolve({ stl: Buffer.isBuffer(stl) ? stl : Buffer.from(stl), stdout, stderr }));
            emitter.on('error', reject);
        });
    }
}
