/**-----------------------------------------------------------------------------
 * Config
 *
 * Interface containing all configurations that are used by Typescript parts of extension
 *----------------------------------------------------------------------------*/

import { LogLevel } from './logging-service';

/** Extension config values */
export interface ScadConfig {
    openscadPath?: string;
    openScadPanelMode?: 'wasm' | 'native';
    launchArgs?: string[];
    skipLaunchPathValidation?: boolean;
    maxInstances?: number;
    showKillMessage?: boolean;
    preferredExportFileExtension?: string;
    exportNameFormat?: string;
    skipSaveDialog?: boolean;
    saveDialogExportNameFormat?: string;
    displayInStatusBar?: string;
    colorScheme?: string;
    openToSide?: string;
    logLevel?: LogLevel;
}

// Reflects the defaults configuration in package.json
export const DEFAULT_CONFIG: Required<ScadConfig> = {
    openscadPath: '',
    openScadPanelMode: 'wasm',
    skipLaunchPathValidation: false,
    launchArgs: [],
    maxInstances: 0,
    showKillMessage: true,
    logLevel: 'INFO',
    preferredExportFileExtension: 'stl',
    exportNameFormat: '${fileBasenameNoExtension}.${exportExtension}',
    skipSaveDialog: false,
    saveDialogExportNameFormat: '',
    displayInStatusBar: 'openDoc',
    colorScheme: 'auto',
    openToSide: 'beside',
};
