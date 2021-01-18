# Changelog

## [1.0.2] - (2020-12-09)

### Fixed

- Updated cheatsheet (See PR: #8). Thanks [ckittle](https://github.com/ckittel)
- Included path to openscad command in error message for invalid openscad command
- Configurations with markdownDescription were showing a less descriptive, plaintext description now shows the full description
- Syntax highlighting (See issue #5)
    - Improved highlighting of `include` and `use` statements
    - Highlighting of non-alpha characters used within a customizer section header
      or any character outside the `[]` does not prevent the `[]` from being highlighted
    - Inline customizer syntax for defining possible values do not highlight when preceded by only spaces

### Development

- Added files to test syntax highlighting

## [1.0.1] - (2020-07-19)

### Fixed

- Fixed vulnerability with Lodash

## [1.0.0] - (2020-06-19)

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

## [0.1.2] - (2020-03-23)

### Fixed

- Fixed syntax highlighting not working on case sensitive operating systems (i.e. Linux)

## [0.1.0] - (2020-03-17)

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
        - Known bug: When set to `openDoc`, the status bar icon won't _initially_ show up until viewing a `.scad` file, even if one is open in another tab.
    - `openscad.cheatsheet.colorScheme`: The color scheme used for the cheatsheet. Default uses VSCode's current theme for colors, but the original color scheme is available if desired.
        - `openscad.cheatsheet.openToSide`: Open the cheatsheet in the current column or beside the current column

## [0.0.1] - (2020-02-23)

### Initial release

Includes syntax highlighting and snippets.
