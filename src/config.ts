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
    autoNamingFormat?: string;
    useAutoNamingExport?: boolean;
    useAutoNamingInSaveDialogues?: boolean;
    displayInStatusBar?: string;
    colorScheme?: string;
    lastColorScheme?: string;
    openToSide?: string;
}

// DEBUG variable. Set to false when compiling for release to disable all console logging
export const DEBUG = false;