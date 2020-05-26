/*---------------------------------------------------------------------------------------------
 * Config
 * 
 * Interface containing all configurations that are used by Typescript parts of extension
 *--------------------------------------------------------------------------------------------*/

// Extension config values
export interface ScadConfig
{
    openscadPath?: string;
    lastOpenscadPath?: string;
    maxInstances?: number;
    showKillMessage?: boolean;
    preferredExportFileExtension?: string;
    exportFormat?: string;
    alwaysPromptFilenameOnExport?: boolean;
    displayInStatusBar?: string;
    colorScheme?: string;
    lastColorScheme?: string;
    openToSide?: boolean;
}