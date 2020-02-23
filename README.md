# OpenSCAD Extension

OpenSCAD language support extension by Antyos.

Use VS Code to edit OpenSCAD files.

This extension builds upon the "scad" extension by Erik Benson and expanded upon by GitHub user `atnbueno` (https://github.com/atnbueno/vscode-lang-scad)

## Features

This extension features:
- Syntax highlighting for OpenSCAD and user functions
- Snippets
- Open with OpenSCAD button

\!\[feature X\]\(images/feature-x.png\)

> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow.

## Requirements

Currently assumes OpenSCAD is installed to: 
`"C:\Program Files\OpenSCAD\openscad.exe"`
to be able to open `.scad` files with OpenSCAD

Make sure to have `Automatic Reload and Preview` checked under `Design > Automatic Reload and Preview`

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `myExtension.enable`: enable/disable this extension
* `myExtension.thing`: set to `blah` to do something

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## To-Do
- Add OpenSCAD logo for .scad file extensions once that becomes a feature in vscode. 
See: [Issue: 14662](https://github.com/microsoft/vscode/issues/14662).
- Add screenshots and gifs
- Add "Open with OpenSCAD" button
   - Add option for custom OpenSCAD installation director
   - Extension should auto-install its own copy of OpenSCAD

## Release Notes

### 1.0.0

Initial release.

## Notes
I made this extension because I like OpenSCAD and there wasn't any language support in VS Code I liked. While I will try and keep this extension up to date, I make no promises. As is, it has taken me months (on and off) to learn RegEx and TextMate grammars to develop the syntax highlighting.

If you want to make changes to the grammar in the `.yaml-tmlanguage` file, you will need to convert it to `.json` before VSCode can use it. Run:

`npm install` to download `js-yaml` for the conversion process. After that, you can run:

`npx js-yaml syntaxes/scad.yaml-tmLanguage > syntaxes/scad.tmLanguage.json`

Or, alternatively just run `makescad.bat` to convert `syntaxes/scad.yaml-tmlanguage` to `syntaxes/scad.tmlanguage.json`