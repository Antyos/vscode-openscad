# OpenSCAD Extension

Edit OpenSCAD files with all the luxuries of VSCode!

Project is available at: https://github.com/Antyos/vscode-openscad

This extension builds upon the "scad" extension by Erik Benson and expanded upon by GitHub user `atnbueno` (https://github.com/atnbueno/vscode-lang-scad)

## Features

This extension features:
- Syntax highlighting for built-in OpenSCAD and user modules/functions
- Snippets

Comparison of VSCode with OpenSCAD plugin (left) and default OpenSCAD editor (right)
![Comparison](https://github.com/Antyos/vscode-openscad/blob/master/images/comparison.png)
Code: https://files.openscad.org/examples/Basics/intersection.html

## Usage

Open your `.scad` file in VSCode and also in OpenSCAD.

Make sure to have `Automatic Reload and Preview` checked under `Design > Automatic Reload and Preview`.

You may also want to disable the editor and customizer panels in OpenSCAD by checking `View > Hide Editor` and `View > Hide Customizer`.

When you save your file in VSCode, it will automatically preview in OpenSCAD.

## To-Do
- Add OpenSCAD logo for .scad file extensions once that becomes a feature in vscode. 
(See [Issue: 14662](https://github.com/microsoft/vscode/issues/14662)).
- Add screenshots and gifs
- Add "Preview with OpenSCAD" button (Opens and previes the file in OpenSCAD)
   - Add option for custom OpenSCAD installation director
   - Extension should auto-install its own copy of OpenSCAD

## Release Notes

### 0.0.1

Initial release.

## Notes
I made this extension because I like OpenSCAD and there wasn't any language support in VS Code I liked. While I will try and keep this extension up to date, I make no promises. As is, it has taken me months (on and off) to learn RegEx and TextMate grammars to develop the syntax highlighting.

If you want to make changes to the grammar in the `.yaml-tmlanguage` file, you will need to convert it to `.json` before VSCode can use it. Run:

`npm install` to download `js-yaml` for the conversion process. After that, you can run:

`npx js-yaml syntaxes/scad.yaml-tmLanguage > syntaxes/scad.tmLanguage.json`

Or, alternatively just run `makescad.bat` to convert `syntaxes/scad.yaml-tmlanguage` to `syntaxes/scad.tmlanguage.json`