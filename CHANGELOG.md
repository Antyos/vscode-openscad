# Changelog

## [[1.3.2](https://github.com/Antyos/vscode-openscad/releases/tag/v1.3.2)] - (2025-01-30)

### Added

- `openscad.experimental.skipLaunchPathValidation` configuration. (Not an ideal
  approach, but it should work.)
- Better logging.

### Fixed

- Errors when validating OpenSCAD executable. (See PR
  [#69](https://github.com/Antyos/vscode-openscad/pull/69)).
    - Executable path not considered valid if `openscad --version` does not
    output to `stdout` (See
    [#62](https://github.com/Antyos/vscode-openscad/issues/62)).
        - Enable `openscad.experimental.skipLaunchPathValidation` to bypass the
        check `openscad --version` check.
    - Simlink to OpenSCAD executable or VS Code itself not resolving correctly.
    (See [#68](https://github.com/Antyos/vscode-openscad/issues/68)).

## [[1.3.1](https://github.com/Antyos/vscode-openscad/releases/tag/v1.3.1)] - (2024-02-01)

### Fixed

- Fixed incorrect display of deprecation warnings related to
  [#58](https://github.com/Antyos/vscode-openscad/pull/58).
  (See PR[#61](https://github.com/Antyos/vscode-openscad/pull/35)).
  Thanks [bluekeyes](https://github.com/bluekeyes).

## [[1.3.0](htts://github.com/Antyos/vscode-openscad/releases/tag/v1.3.0)] - (2023-01-16)

### Changed

- Configurations (See PR [#58](https://github.com/Antyos/vscode-openscad/pull/58))

    | Old | New |
    | --- | --- |
    | `openscad.export.autoNamingFormat` | `openscad.export.exportNameFormat` |
    | `openscad.export.useAutoNamingExport`  |  `openscad.export.skipSaveDialog`  |
    | `openscad.export.useAutoNamingInSaveDialogues` | `openscad.export.saveDialogExportNameFormat` |

### Added

- Override `openscad.export.exportNameFormat` on a per-file basis. (See PR
  [#58](https://github.com/Antyos/vscode-openscad/pull/58)).
- `openscad.export.exportNameFormat` now supports date time variables. Use `${date}`
  for an ISO 8601 date string or use a custom format with: `${date:TEMPLATE}`
  according to [Luxon tokens](https://moment.github.io/luxon/#/formatting?id=table-of-tokens).
  (See PR [#57](https://github.com/Antyos/vscode-openscad/issues/57))
  Fixes: [#55](https://github.com/Antyos/vscode-openscad/issues/55).

### Fixed

- Auto versioning started at "-Infinity" instead of "1" for a folder without
  similarly named files.

### Deprecated

- Configurations (See PR [#58](https://github.com/Antyos/vscode-openscad/pull/58))
    - `openscad.export.autoNamingFormat`
    - `openscad.export.useAutoNamingExport`
    - `openscad.export.useAutoNamingInSaveDialogues`

## [[1.2.2](htts://github.com/Antyos/vscode-openscad/releases/tag/v1.2.2)] - (2023-10-09)

### Added

- Implemented logging-service.ts based on the one found in the prettier/prettier-vscode. This should make it easier for troubleshooting issues in the future.
- `openscad.showOutput` command to display the output channel.
- `openscad.logLevel` configuration to set the output channel log level.

### Fixed

- Bug with `openscad.launchPath` using an empty value. Should help with
  [#49](https://github.com/Antyos/vscode-openscad/issues/49) and
  [#50](https://github.com/Antyos/vscode-openscad/issues/50)

## [[1.2.1](https://github.com/Antyos/vscode-openscad/releases/tag/v1.2.1)] - (2023-07-26)

### Added

- Find widget in Cheatsheet. Fixes [#42](https://github.com/Antyos/vscode-openscad/issues/42) (See
  PR[#47](https://github.com/Antyos/vscode-openscad/pull/47)). Thanks [Duckapple](https://github.com/Duckapple)

## [[1.2.0](https://github.com/Antyos/vscode-openscad/releases/tag/v1.2.0)] - (2023-07-22)

### Added

- `openscad.launchArgs` configuration. Fixes [#36](https://github.com/Antyos/vscode-openscad/issues/36).

#### Web extension

VSCode OpenSCAD can now run as a web extension!

- Syntax highlighting and OpenSCAD cheatsheet are available when using VS Code
  for the web
- Preview- and export- related commands are not available when running as a web
  extension. Attempting to run these commands will display a popup notification
  that the commands are disabled when running as a web extension.

### Fixed

- Syntax highlighting for `$vpf` (See PR[#35](https://github.com/Antyos/vscode-openscad/pull/35)). Thanks [atnbueno](https://github.com/atnbueno)

### Development

- Migrated to PNPM for package management. (See PR[#46](https://github.com/Antyos/vscode-openscad/pull/46)).

## [[1.1.1](https://github.com/Antyos/vscode-openscad/releases/tag/v1.1.1)] - (2021-06-07)

### Changed

- Cheatsheet version to v2021.01 (See PR[#23](https://github.com/Antyos/vscode-openscad/pull/23))
- `poly` snippet (See PR[#22](https://github.com/Antyos/vscode-openscad/pull/22)). Thanks [mathiasvr](https://github.com/mathiasvr)
- License from LGPL-3 to GPL-3 to be consistent with [openscad/openscad](https://github.com/openscad/openscad)

### Fixed

- Various vulnerabilities related to outdated dependencies. All dependencies have been updated.

## [[1.1.0](https://github.com/Antyos/vscode-openscad/releases/tag/v1.1.0)] - (2021-01-18)

### Added

- `difference()` to snippets (See PR [#11](https://github.com/Antyos/vscode-openscad/pull/11)). Thanks [williambuttenham](https://github.com/williambuttenham)
- Keybinding `F5` for `openscad.preview` (See PR [#12](https://github.com/Antyos/vscode-openscad/pull/12)). Closes [#7](https://github.com/Antyos/vscode-openscad/issues/7). Thanks [williambuttenham](https://github.com/williambuttenham)
- Keybinding `F6` for `openscad.render`

### Development

- Updated `@types/node` from v9.4.6 to v14.14.20 (*WHY* did I leave this outdated for so long???)
- Upgraded from TSLint to ESLint
- Added Prettier and formatting styles
- Reformatred all code according to styles set by ESLint and Prettier

<!-- markdownlint-disable-next-line MD036 -->
*See PR [#14](https://github.com/Antyos/vscode-openscad/pull/14) and PR [#15](https://github.com/Antyos/vscode-openscad/pull/15) for details on the above*

## [[1.0.2](https://github.com/Antyos/vscode-openscad/releases/tag/v1.0.2)] - (2020-12-09)

### Fixed

- Updated cheatsheet (See PR [#8](https://github.com/Antyos/vscode-openscad/pull/8)). Thanks [ckittle](https://github.com/ckittel)
- Included path to openscad command in error message for invalid openscad command
- Configurations with markdownDescription were showing a less descriptive, plaintext description now shows the full description
- Syntax highlighting (See issue [#5](https://github.com/Antyos/vscode-openscad/issues/5))
    - Improved highlighting of `include` and `use` statements
    - Highlighting of non-alpha characters used within a customizer section header
      or any character outside the `[]` does not prevent the `[]` from being highlighted
    - Inline customizer syntax for defining possible values do not highlight when preceded by only spaces

### Development

- Added files to test syntax highlighting

## [1.0.1] - (2020-07-19)

### Fixed

- Fixed vulnerability with Lodash

## [[1.0.0](https://github.com/Antyos/vscode-openscad/releases/tag/v1.0.0)] - (2020-06-19)

### Added

- Commands
    - **Preview in OpenSCAD** (`openscad.preview`) launches an instance of OpenSCAD to preview a `.scad` file
        - Only available in context menu and command palette for `.scad` files
        - Preview button in editor/title is shown for all `.scad` files
    - **Kill OpenSCAD Previews** (`openscad.kill`) kills a single open instance of OpenSCAD
        - Only available when there are open previews
        - Opens a Quick-Pick box to select one of the open previews to kill (or choose **Kill All** to kill them all)
    - **Kill All OpenSCAD Previews** (`openscad.killAll`) kills all open previews
        - Only available when there are open previews
    - (Hidden) `openscad.autoKill` functions as **Kill All** if one preview is open, otherwise functions as **Kill**
        - Only accesible through button on editor/title bar
    - **Export Model** (`openscad.exportByConfig`) exports model based on config: `openscad.export.preferredFileExtension`
        - Only available in context menu and command palette for `.scad` files
    - **Export Model (Select File Type)** (`openscad.exportByType`) exports model to a selected file type
        - Only available in command palette for `.scad` files
        - Opens quick-pick box to select file type
    - **Export Model with Save Dialogue** (`openscad.exportWithSaveDialogue`) exports model using a save dialogue
        - Only available in context menu and command palette for `.scad` files
        - Replaces `openscad.exportByConfig` in context menus when holding alt
- Menu buttons (in editor/title for `scad` files)
    - **Preview** - Runs `openscad.preview`
    - **Kill** - Runs `openscad.autoKill`. If `alt` is held, runs `openscad.kill`
    - **Export** - Runs `openscad.exportByConfig`. If `alt` is held, runs `openscad.exportByType`
- Configurations
    - `openscad.launchPath` - Overrides default path to `openscad` executable.
    - `openscad.maxInstances` - Limits the max number of preview windows open at one time. Set 0 for no limit.
    - `openscad.showKillMessage` - Show message when a preview is killed.
    - `openscad.export.preferredExportFileExtension` - Preferred file extension to use when exporting using the 'Export' button in the editor title bar. Set to `none` to select the file extension each time.
    - `openscad.export.autoNamingFormat` - A configurable string that dynamically names exported files.
    - `openscad.export.useAutoNamingExport` - Setting to true will replace the standard behavior of **Export Model** to automatically export files according to the name specified in openscad.export.autoNamingFormat` instead of opening a save dialogue.
    - `openscad.export.useAutoNamingInSaveDialogues` - The default name of to-be exported files in save dialouges will be generated according to the config of `openscad.export.autoNamingFormat` instead of using the original filename.
    - `openscad.interface.showPreviewIconInEditorTitleMenu` - Shows **Preview in OpenSCAD** button in editor title menu (right side of tabs).
    - `openscad.interface.showKillIconInEditorTitleMenu` - Shows **Kill OpenSCAD Previews** button in editor title menu (right side of tabs).
    - `openscad.interface.showExportIconInEditorTitleMenu` - Shows **Export Model** button in editor title menu (right side of tabs).
    - `openscad.interface.showCommandsInEditorTitleContextMenu` - Shows preview and export commands in editor title (tab) context menu.
    - `openscad.interface.showCommandsInExplorerContextMenu` - Shows preview and export commands in explorer context menu.
    - `openscad.interface.showPreviewInContextMenus` - Shows **Preview in OpenSCAD** command in context menus.
    - `openscad.interface.showExportInContextMenus` - Shows **Export Model** command in context menus.
- Grammar
    - Added unicode/hex escape codes in strings. See: <https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Text>, for details on escape codes in strings.

### Changed

- `scad.cheatsheet` command is now `openscad.cheatsheet` for consistancy with configurations
- `openscad.cheatsheet.openToSide` configuration is an enumerated string instead of a boolean for improved clarity. Options now include `beside` (was `true`) and `currentGroup` (was `false`)

## [[0.1.2](https://github.com/Antyos/vscode-openscad/releases/tag/v0.1.2)] - (2020-03-23)

### Fixed

- Fixed syntax highlighting not working on case sensitive operating systems (i.e. Linux)

## [[0.1.0](https://github.com/Antyos/vscode-openscad/releases/tag/v0.1.0)] - (2020-03-17)

### Added

- Syntax highlighting for OpenSCAD Customizer widgets. Highlighting support includes:
    - Drop down boxes
    - Slider
    - Tabs
- `Open OpenSCAD Cheatsheet` command to natively launch the OpenSCAD cheatsheet in VSCode
    - Included a status bar icon for easy access to the command
    - By default, it is visible whenever a `.scad` file is in an open tab
- Extension Configurations:
    - `openscad.cheatsheet.displayInStatusBar`: When the "Open Cheatsheet" button should be displaying in the status bar
        - Known bug: When set to `openDoc`, the status bar icon won't *initially* show up until viewing a `.scad` file, even if one is open in another tab.
    - `openscad.cheatsheet.colorScheme`: The color scheme used for the cheatsheet. Default uses VSCode's current theme for colors, but the original color scheme is available if desired.
        - `openscad.cheatsheet.openToSide`: Open the cheatsheet in the current column or beside the current column

## [[0.0.1](https://github.com/Antyos/vscode-openscad/releases/tag/v0.0.1)] - (2020-02-23)

### Initial release

Includes syntax highlighting and snippets.
