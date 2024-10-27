/**-----------------------------------------------------------------------------
 * openscad-exe
 *
 * Manages access to the Openscad executable file
 *----------------------------------------------------------------------------*/

import * as child from 'child_process'; // node:child_process
import { type } from 'os'; // node:os
import { promisify } from 'util';

import commandExists = require('command-exists');
import { realpath } from 'fs/promises';

import { LoggingService } from 'src/logging-service';

const execFile = promisify(child.execFile);

const pathByPlatform = {
    Linux: 'openscad',
    Darwin: '/Applications/OpenSCAD.app/Contents/MacOS/OpenSCAD',
    Windows_NT: 'C:\\Program Files\\Openscad\\openscad.exe',
} as const;

export interface OpenscadExecutable {
    version: string;
    filePath: string;
    arguments_: string[];
}

/** Open an instance of OpenSCAD to preview a file */
export class OpenscadExecutableManager {
    // Paths
    private openscadExecutable?: OpenscadExecutable;
    private openscadPath?: string;
    private arguments_: string[] = [];

    public constructor(private loggingService: LoggingService) {}

    private async getOpenscadVersion(
        openscadPath: string,
        arguments_: string[] = []
    ): Promise<string | undefined> {
        try {
            const { stdout, stderr } = await execFile(openscadPath, [
                ...arguments_,
                '--version',
            ]);

            // For some reason, OpenSCAD seems to use stderr for all console output...
            // If there is no error, assume stderr should be treated as stdout
            // For more info. see: https://github.com/openscad/openscad/issues/3358
            const output = stdout || stderr;

            return output.trim().match(/version (\S+)/)?.[1];
        } catch (error) {
            this.loggingService.logError(
                `Error getting OpenSCAD version: ${error}`
            );
            return undefined;
        }
    }

    /** Set the path to `openscad.exe` on the system.
     *
     * Note: Must be called before opening children.
     */
    public async updateScadPath(
        newOpenscadPath?: string,
        newArguments: string[] = [],
        skipLaunchPathValidation = false
    ): Promise<void> {
        if (
            newOpenscadPath === this.openscadPath &&
            newArguments === this.arguments_
        ) {
            return;
        }

        this.openscadPath = newOpenscadPath;
        this.arguments_ = newArguments;
        this.openscadExecutable = undefined;

        // Use platform default if not specified
        let openscadPath = this.getPath();

        this.loggingService.logInfo(
            `Checking OpenSCAD path: '${openscadPath}'`
        );

        // Resolve potential symlinks
        try {
            const newPath = await realpath(openscadPath);
            if (newPath !== openscadPath) {
                this.loggingService.logInfo(
                    `Configured path is a link. Using resolved path: '${openscadPath}'`
                );
                openscadPath = newPath;
            }
        } catch (error) {
            // An ENOENT error (Error No Entity) is expected if openscadPath is
            // invalid and is ok. Otherwise, throw the error
            if (
                !(error instanceof Error) ||
                !('code' in error) ||
                error.code !== 'ENOENT'
            ) {
                throw error;
            }
        }

        // TODO: Replace with something less nested
        commandExists(openscadPath, async (error: null, exists: boolean) => {
            if (!exists) {
                this.loggingService.logWarning(
                    `'${openscadPath}' is not a valid path or command.`
                );
                if (!skipLaunchPathValidation) {
                    return;
                }
                this.loggingService.logInfo('Skipping OpenSCAD path check.');
            }
            let version = await this.getOpenscadVersion(
                openscadPath,
                this.arguments_
            );
            // Should we throw an error here?
            if (!version) {
                this.loggingService.logWarning(
                    `Unable to determine OpenSCAD version with 'openscad --version'.`
                );
                if (!skipLaunchPathValidation) {
                    return;
                }
                this.loggingService.logInfo('Skipping OpenSCAD version check.');
                version = 'unknown';
            }
            this.openscadExecutable = {
                version: version,
                filePath: openscadPath,
                arguments_: this.arguments_,
            };
            this.loggingService.logInfo(
                'Using OpenSCAD:',
                this.openscadExecutable
            );
        });
    }

    /** A valid openscad executable or undefined */
    public get executable() {
        return this.openscadExecutable;
    }

    /** The current path the manager is looking for openscad at. Not guaranteed
     * to be valid. */
    public getPath() {
        return (
            this.openscadPath ||
            pathByPlatform[type() as keyof typeof pathByPlatform]
        );
    }
}
