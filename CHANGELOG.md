# Changelog

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
