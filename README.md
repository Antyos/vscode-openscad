# OpenSCAD Extension

OpenSCAD language support extension by Antyos.

Edit OpenSCAD files with all the luxuries of VS Code!

Project is available at: https://github.com/Antyos/vscode-openscad

This extension builds upon the "scad" extension by Erik Benson and expanded upon by GitHub user `atnbueno` (https://github.com/atnbueno/vscode-lang-scad)

## Features

This extension features:
- Syntax highlighting for built-in OpenSCAD and user modules/functions
- Snippets

## To-Do
- Add OpenSCAD logo for .scad file extensions once that becomes a feature in vscode. 
See: [Issue: 14662](https://github.com/microsoft/vscode/issues/14662).
- Add screenshots and gifs
- Add "Open with OpenSCAD" button
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