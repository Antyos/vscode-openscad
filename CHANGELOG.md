# Changelog

## [Unreleased]

### Added 'Preview'

- `scad.preview` command launches an instance of OpenSCAD to preview a `.scad` file
- `scad.kill` and `scad.killAll` commands kill selected or all open previews
- Configurations
  - `openscad.launchPath` specifies the location of the `openscad.exe` executable
  - `openscad.maxInstances` limits the max number of preview windows open at one time

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
