/*---------------------------------------------------------------------------------------------
 * Export File Extensions
 *
 * Contains types and objects relating to exportable file types
 *--------------------------------------------------------------------------------------------*/

// Avaiable file extensions for export
export type TExportFileExt =
    | 'stl'
    | 'off'
    | 'amf'
    | '3mf'
    | 'csg'
    | 'dxf'
    | 'svg'
    | 'png'
    | 'echo'
    | 'ast'
    | 'term'
    | 'nef3'
    | 'nefdbg';

export const ExportFileExt: TExportFileExt[] = [
    'stl',
    'off',
    'amf',
    '3mf',
    'csg',
    'dxf',
    'svg',
    'png',
    'echo',
    'ast',
    'term',
    'nef3',
    'nefdbg',
];

// File types used in save dialogue
export const ExportExtForSave = {
    STL: ['stl'],
    OFF: ['off'],
    AMF: ['amf'],
    '3MF': ['3mf'],
    CSG: ['csg'],
    DXF: ['dxf'],
    SVG: ['svg'],
    PNG: ['png'],
    'Echo file output': ['echo'],
    AST: ['ast'],
    TERM: ['term'],
    NEF3: ['nef3'],
    NEFDBG: ['nefdbg'],
};
