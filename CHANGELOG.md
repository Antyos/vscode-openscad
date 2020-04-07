# Changelog

## [Unreleased]

### Added

- Commands
    - `Preview in OpenSCAD` (`scad.preview`) launches an instance of OpenSCAD to preview a `.scad` file
        - Only available in context menu and command palette for `.scad` files
        - Preview button in editor/title is shown for all `.scad` files
    - `Kill OpenSCAD Previews` (`scad.kill`) kills a single open instance of OpenSCAD
        - Only available when there are open previews
        - Opens a Quick-Pick box to select one of the open previews to kill (or choose `Kill All` to kill them all)
    - `Kill All OpenSCAD Previews` (`scad.killAll`) kills all open previews
        - Only available when there are open previews
    - (Hidden) `scad.autoKill` functions as `Kill All` if one preview is open, otherwise functions as `Kill`
        - Only accesible through button on editor/title bar
    - `Export Model to File Type` (`scad.exportByType`) exports model to a selected file type
        - Only available in context menu and command palette for `.scad` files
        - Opens quick-pick box to select file type
        - Replaces `scad.exportByConfig` in context menus when holding alt
    - `Export Model` (`scad.exportByConfig`) exports model based on config: `openscad.preferredFileExtension`
        - Only available in context menu and command palette for `.scad` files
    - `Export Model to STL` (`scad.exportToStl`) exports model to `.stl`
        - Only available in context menu and command palette for `.scad` files
- Menu buttons (in editor/title for `scad` files)
    - `Preview`: Runs `scad.preview`
    - `Kill`: Runs `scad.autoKill`
    - `Export`: Runs `scad.exportByConfig`. If `alt` is held, runs `scad.exportByType`
- Configurations
    - `openscad.launchPath`: Overrides default path to `openscad` executable.
    - `openscad.maxInstances`: Limits the max number of preview windows open at one time. Set 0 for no limit.
    - `openscad.showKillMessage`: Show message when a preview is killed.
    - `openscad.preferredExportFileExtension`: Preferred file extension to use when exporting using the 'Export' button in the editor title bar. Set to `none` to select the file extension each time.
    - `openscad.interface.showPreviewIconInEditorTitleMenu`: Shows `Preview in OpenSCAD` button in editor title menu (right side of tabs).
    - `openscad.interface.showKillIconInEditorTitleMenu`: Shows `Kill OpenSCAD Previews` button in editor title menu (right side of tabs).
    - `openscad.interface.showExportIconInEditorTitleMenu`: Shows `Export Model` button in editor title menu (right side of tabs).
    - `openscad.interface.showCommandsInEditorTitleContextMenu`: Shows commands in editor title (tab) context menu.
    - `openscad.interface.showCommandsInExplorerContextMenu`: Shows commands in explorer context menu.
    - `openscad.interface.showPreviewInContextMenus`: Shows `Preview in OpenSCAD` command in context menus.
    - `openscad.interface.showExportInContextMenus`: Shows `Export Model` command in context menus.
    - `openscad.interface.showExportToStlInContextMenus`: Shows `Export to STL` command in context menus.
- TODO
    - Add export variables like in [tasks.json](https://code.visualstudio.com/docs/editor/variables-reference) for options below
    - Launch file with args (get user input for args)
    - Export file name format (in config)
        - Consider adding export map for each format

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
