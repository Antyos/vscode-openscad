/**-----------------------------------------------------------------------------
 * Export File Extensions
 *
 * Contains types and objects relating to exportable file types
 *----------------------------------------------------------------------------*/

/** List of all file exportable extensions */
export const ExportFileExtensionList = [
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
] as const;

/** Avaiable file extensions for export */
export type ExportFileExtension = (typeof ExportFileExtensionList)[number];

/** File types used in save dialogue */
export const ExportExtensionsForSave = {
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
