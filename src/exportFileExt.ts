/*---------------------------------------------------------------------------------------------
 * Export File Extensions
 * 
 * Contains types and objects relating to exportable file types
 *--------------------------------------------------------------------------------------------*/

 // Avaiable file extensions for export
export type TExportFileExt = 'stl'|'off'|'amf'|'3mf'|'csg'|'dxf'|'svg'|'png'|'echo'|'ast'|'term'|'nef3'|'nefdbg';
export const ExportFileExt:TExportFileExt[] = 
                            ['stl','off','amf','3mf','csg','dxf','svg','png','echo','ast','term','nef3','nefdbg'];

// File types used in save dialogue
export const ExportExtForSave = {
    "STL Files": ["stl"],
    "OFF Files": ["off"],
    "AMF Files": ["amf"],
    "3MF Files": ["3mf"],
    "CSG Files": ["csg"],
    "DXF Files": ["dxf"],
    "Scalable Vector Graphics": ["svg"],
    "Portable Network Graphic": ["png"],
    "Echo file output": ["echo"],
    "AST Files": ["ast"],
    "TERM Files": ["term"],
    "NEF3 Files": ["nef3"],
    "NEFDBG Files": ["nefdbg"] 
}