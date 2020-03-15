import * as vscode from 'vscode';
// import * as path from 'path';

// Cheatsheet config values
export interface CheatsheetConfig
{
    displayInStatusBar?: boolean;
    openToSide?: boolean;
}

// Class for Cheatsheet webview and commands
export class Cheatsheet
{
    public static readonly csCommandId: string = 'scad.cheatsheet'; // Command id for opening the cheatsheet

    public static currentPanel: Cheatsheet | undefined;        // Webview Panel

    public static csStatusBarItem: vscode.StatusBarItem;            // Cheatsheet status bar item 

    private readonly _panel: vscode.WebviewPanel;
    private _disposables: vscode.Disposable[] = [];
    private static config: CheatsheetConfig = {};   
    private static isScadDocument: boolean;                     // Is current document openSCAD

    // Create or show cheatsheet panel
    public static createOrShowPanel() 
    {
        // Determine which column to show cheatsheet in
        // If not active editor, check config to open in current window to to the side
        let column = vscode.window.activeTextEditor
            ? (Cheatsheet.config.openToSide ? vscode.ViewColumn.Beside : vscode.window.activeTextEditor.viewColumn)
            : undefined;


        if (Cheatsheet.currentPanel) 
        {
            // If we already have a panel, show it in the target column
            Cheatsheet.currentPanel._panel.reveal(column);
            return;
        } 
        
        // Otherwise, create and show new panel
        const panel = vscode.window.createWebviewPanel(
            'cheatsheet',                                   // Indentifies the type of webview. Used internally
            'OpenSCAD Cheat Sheet',                         // Title of panel displayed to the user
            column || vscode.ViewColumn.One,        // Editor column
            {
                // Only allow webview to access certain directory
                // localResourceRoots: [ vscode.Uri.file(path.join(context.extensionPath, 'cheat-sheet')) ]
            }   // Webview options
        );

        // const onDiskPath = vscode.Uri.file(
        //     path.join(context.extensionPath, 'cheat-sheet', 'OpenSCAD CheatSheet.html')
        // );

        // currentPanel.webview.asWebviewUri(onDiskPath);

        // Set HTML content
        Cheatsheet.currentPanel = new Cheatsheet(panel);

    }

    // Constructor
    private constructor(panel: vscode.WebviewPanel) {
        this._panel = panel;

        // Listen for when panel is disposed
        // This happens when user closes the panel or when the panel is closed progamatically
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        this._panel.webview.html = this.getRawCS();
    }

    // Dispose of panel and clean up resources
    public dispose() {
        Cheatsheet.currentPanel = undefined;

        // Clean up resources
        this._panel.dispose();

        while (this._disposables.length)
        {
            const x = this._disposables.pop();
            if (x)
            {
                x.dispose;
            }
        }
    }

    // Initializes the status bar
    public static createStatusBar() {
        Cheatsheet.csStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
        Cheatsheet.csStatusBarItem.command = Cheatsheet.csCommandId;

        return Cheatsheet.csStatusBarItem;     
    }

    // Show or hide status bar item (OpenSCAD Cheatsheet)
    public static updateStatusBar() {
        // Show `open cheatsheet` button if enabled in config AND current document is of type `openscad`
        if (Cheatsheet.isScadDocument && Cheatsheet.config.displayInStatusBar)
        {
            Cheatsheet.csStatusBarItem.text = 'Open Cheatsheet';
            Cheatsheet.csStatusBarItem.show();
        }
        else
        {
            Cheatsheet.csStatusBarItem.hide();
        }
    }

    // Run on change active text editor
    public static onDidChangeActiveTextEditor() {
        // Determine the languageId of the active text document
        let langId: string | undefined = undefined;
        if (vscode.window.activeTextEditor)
        {
            const currentDocument = vscode.window.activeTextEditor.document;
            
            langId = currentDocument.languageId;

            // See affectsConfiguration | ConfigurationScope
        }
        vscode.window.showInformationMessage("Lang id: " + langId); // DEBUG

        // Set if the document type is SCAD based on the language id
        // Or current current document is the cheatsheet (for visual consistency)
        // Show if SCAD document is open (doesn't have to be active) or there is one in the working directory
        Cheatsheet.isScadDocument = (langId === 'scad')
        Cheatsheet.updateStatusBar();
    }

    // Run when configurations are changed
    public static onDidChangeConfiguration(config: vscode.WorkspaceConfiguration) {
        // Load the configuration changes
        Cheatsheet.config.displayInStatusBar = config.get<boolean>('cheatsheet.displayInStatusBar', true);
        Cheatsheet.config.openToSide = config.get<boolean>('cheatsheet.openToSide', true);

        // Update the status bar
        Cheatsheet.updateStatusBar();
    }

    // Returns raw HTML for cheatsheet
    // TODO: Get from `media/chetsheet.html`
    private getRawCS() {
        return `<!DOCTYPE html>
        <!-- saved from url=(0036)https://www.openscad.org/cheatsheet/ -->
        <html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <meta name="viewport" content="width=device-width; initial-scale=1.0; maximum-scale=1.0; user-scalable=no;">
        
        <link rel="shortcut icon" type="image/x-icon" href="https://www.openscad.org/cheatsheet/images/favicon.ico">
        <link type="text/css" rel="stylesheet" href="./OpenSCAD CheatSheet_files/normalize.css" media="all">
        <link type="text/css" rel="stylesheet" href="./OpenSCAD CheatSheet_files/fonts.css" media="all">
        <link type="text/css" rel="stylesheet" href="./OpenSCAD CheatSheet_files/main.css" media="all">
        <link type="text/css" rel="stylesheet" href="./OpenSCAD CheatSheet_files/print.css" media="print">
        <title>OpenSCAD CheatSheet</title>
                <script type="text/javascript" async="" src="./OpenSCAD CheatSheet_files/ga.js.download"></script><script type="text/javascript">
                var _gaq = _gaq || [];
                _gaq.push(['_setAccount', 'UA-26999768-1']);
                _gaq.push(['_setDomainName', 'openscad.org']);
                _gaq.push(['_gat._anonymizeIp']); // For gdpr
                _gaq.push(['_gat._forceSSL']); // Send all hits using SSL, even from insecure (HTTP) pages.
                _gaq.push(['_trackPageview']);
                
                (function() {
                var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
                ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
                var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
                })();
                </script>
        </head>
        <body class="vsc-initialized">
        <header>
            <h1 class="title" style="position:relative;"><span class="green">Open</span>SCAD</h1>
            <h2>v2019.05</h2>
        </header>
        <section>
            <section>
            <article>
                <h2>Syntax</h2>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/General#Variables">var</a> = <a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/General#Values_and_Data_Types">value</a>;</code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/General#Variables">var</a> = cond <a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Conditional_and_Iterator_Functions#Conditional_?_:">?</a> value_if_true <a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Conditional_and_Iterator_Functions#Conditional_?_:">:</a> value_if_false;</code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/User-Defined_Functions_and_Modules#Modules">module</a> name(…) { … }<br>
                name();</code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/User-Defined_Functions_and_Modules#Functions">function</a> name(…) = …<br>
                name();</code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Include_Statement">include</a> &lt;….scad&gt;</code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Include_Statement">use</a> &lt;….scad&gt;</code>
            </article>
            <article>
                <h2>Constants</h2>
                <dl>
                <dt><code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/General#The_Undefined_Value">undef</a></code></dt>
                <dd>undefined value</dd>
                <dt><code>PI</code></dt>
                <dd>mathematical constant <a href="https://en.wikipedia.org/wiki/Pi">π</a> (~3.14159)</dd>
                </dl>
            </article>
            <article>
                <h2>Special variables</h2>
                <dl>
                <dt><code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Other_Language_Features#.24fa.2C_.24fs_and_.24fn">$fa</a></code></dt>
                <dd>minimum angle</dd>
                <dt><code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Other_Language_Features#.24fa.2C_.24fs_and_.24fn">$fs</a></code></dt>
                <dd>minimum size</dd>
                <dt><code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Other_Language_Features#.24fa.2C_.24fs_and_.24fn">$fn</a></code></dt>
                <dd>number of fragments</dd>
                <dt><code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Other_Language_Features#.24t">$t</a></code></dt>
                <dd>animation step</dd>
                <dt><code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Other_Language_Features#.24vpr.2C_.24vpt_and_.24vpd">$vpr</a></code></dt>
                <dd>viewport rotation angles in degrees</dd>
                <dt><code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Other_Language_Features#.24vpr.2C_.24vpt_and_.24vpd">$vpt</a></code></dt>
                <dd>viewport translation</dd>
                <dt><code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Other_Language_Features#.24vpr.2C_.24vpt_and_.24vpd">$vpd</a></code></dt>
                <dd>viewport camera distance</dd>
                <dt><code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/User-Defined_Functions_and_Modules#children">$children</a></code></dt>
                <dd>&nbsp;number of module children</dd>
                <dt><code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Other_Language_Features#$preview">$preview</a></code></dt>
                <dd>&nbsp;true in F5 preview, false for F6</dd>
                </dl>
            </article>
            <article>
                <h2>Modifier Characters</h2>
                <dl>
                <dt><code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Modifier_Characters#Disable_Modifier">*</a></code></dt>
                <dd>disable</dd>
                <dt><code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Modifier_Characters#Root_Modifier">!</a></code></dt>
                <dd>show only</dd>
                <dt><code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Modifier_Characters#Debug_Modifier">#</a></code></dt>
                <dd>highlight / debug</dd>
                <dt><code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Modifier_Characters#Background_Modifier">%</a></code></dt>
                <dd>transparent / background</dd>
                </dl>
            </article>
            </section>
            <section>
            <article>
                <h2>2D</h2>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Using_the_2D_Subsystem#circle">circle</a>(radius | d=diameter)</code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Using_the_2D_Subsystem#square">square</a>(size,center)</code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Using_the_2D_Subsystem#square">square</a>([width,height],center)</code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Using_the_2D_Subsystem#polygon">polygon</a>([points])</code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Using_the_2D_Subsystem#polygon">polygon</a>([points],[paths])</code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Text">text</a>(t, size, font,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;halign, valign, spacing,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;direction, language, script)</code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Importing_Geometry#import">import</a>("….<span class="tooltip">ext<span class="tooltiptext">formats: DXF|SVG</span></span>")</code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Using_the_2D_Subsystem#3D_to_2D_Projection">projection</a>(cut)</code>
            </article>
            <article>
                <h2>3D</h2>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Primitive_Solids#sphere">sphere</a>(radius | d=diameter)</code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Primitive_Solids#cube">cube</a>(size, center)</code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Primitive_Solids#cube">cube</a>([width,depth,height], center)</code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Primitive_Solids#cylinder">cylinder</a>(h,r|d,center)</code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Primitive_Solids#cylinder">cylinder</a>(h,r1|d1,r2|d2,center)</code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Primitive_Solids#polyhedron">polyhedron</a>(points, faces, convexity)</code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Importing_Geometry#import">import</a>("….<span class="tooltip">ext<span class="tooltiptext">formats: STL|OFF|AMF|3MF</span></span>")</code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Using_the_2D_Subsystem#Linear_Extrude">linear_extrude</a>(height,center,convexity,twist,slices)</code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Using_the_2D_Subsystem#Rotate_Extrude">rotate_extrude</a>(angle,convexity)</code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Other_Language_Features#Surface">surface</a>(file = "….<span class="tooltip">ext<span class="tooltiptext">formats: DAT|PNG</span></span>",center,convexity)</code>
            </article>
            <article>
                <h2>Transformations</h2>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Transformations#translate">translate</a>([x,y,z])</code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Transformations#rotate">rotate</a>([x,y,z])</code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Transformations#rotate">rotate</a>(a, [x,y,z])</code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Transformations#scale">scale</a>([x,y,z])</code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Transformations#resize">resize</a>([x,y,z],auto)</code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Transformations#mirror">mirror</a>([x,y,z])</code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Transformations#multmatrix">multmatrix</a>(m)</code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Transformations#color">color</a>("colorname",alpha)</code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Transformations#color">color</a>("#<span class="tooltip">hexvalue<span class="tooltiptext">#rgb|#rgba|#rrggbb|#rrggbbaa</span></span>")</code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Transformations#color">color</a>([r,g,b,a])</code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Transformations#offset">offset</a>(r|delta,chamfer)</code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Transformations#hull">hull</a>()</code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Transformations#minkowski">minkowski</a>()</code>
            </article>
            </section>
        
            <section>
            <article>
                <h2>Boolean operations</h2>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/CSG_Modelling#union">union</a>()</code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/CSG_Modelling#difference">difference</a>()</code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/CSG_Modelling#intersection">intersection</a>()</code>
            </article>
            <article>
                <h2>List Comprehensions</h2>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/List_Comprehensions#for">Generate</a> [ for (i = <i>range</i>|<i>list</i>) i ]</code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/List_Comprehensions#for">Generate</a> [ for (<i>init</i>;<i>condition</i>;<i>next</i>) i ]</code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/List_Comprehensions#each">Flatten</a> [ each i ]</code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/List_Comprehensions#if">Conditions</a> [ for (i = …) if (condition(i)) i ] </code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/List_Comprehensions#if/else">Conditions</a> [ for (i = …) if (condition(i)) x else y ] </code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/List_Comprehensions#let">Assignments</a> [ for (i = …) let (assignments) a ] </code>
            </article>
            <article>
                <h2>Flow Control</h2>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Conditional_and_Iterator_Functions#For_Loop">for</a> (i = [<span>start</span>:<span>end</span>]) { … }</code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Conditional_and_Iterator_Functions#For_Loop">for</a> (i = [<span>start</span>:<span>step</span>:<span>end</span>]) { … }</code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Conditional_and_Iterator_Functions#For_Loop">for</a> (i = […,…,…]) { … }</code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Conditional_and_Iterator_Functions#For_Loop">for</a> (i = …, j = …, …) { … }</code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Conditional_and_Iterator_Functions#Intersection_For_Loop">intersection_for</a>(i = [<span>start</span>:<span>end</span>]) { … }</code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Conditional_and_Iterator_Functions#Intersection_For_Loop">intersection_for</a>(i = [<span>start</span>:<span>step</span>:<span>end</span>]) { … }</code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Conditional_and_Iterator_Functions#Intersection_For_Loop">intersection_for</a>(i = […,…,…]) { … }</code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Conditional_and_Iterator_Functions#If_Statement">if</a> (…) { … }</code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Conditional_and_Iterator_Functions#Let_Statement">let</a> (…) { … }</code>
            </article>
            <article>
                <h2>Type test functions</h2>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Type_Test_Functions#is_undef">is_undef</a></code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Type_Test_Functions#is_bool">is_bool</a></code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Type_Test_Functions#is_num">is_num</a></code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Type_Test_Functions#is_string">is_string</a></code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Type_Test_Functions#is_list">is_list</a></code>
            </article>
            <article>
                <h2>Other</h2>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Other_Language_Features#Echo_Statements">echo</a>(…)</code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Other_Language_Features#Render">render</a>(convexity)</code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/User-Defined_Functions_and_Modules#children">children</a>([idx])</code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Other_Language_Features#assert">assert</a>(condition, message)</code>
                <s><code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Conditional_and_Iterator_Functions#Assign_Statement">assign</a> (…) { … }</code></s>
            </article>
            </section>
        
            <section>
            <article>
                <h2>Functions</h2>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Mathematical_Functions#concat">concat</a></code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Mathematical_Functions#lookup">lookup</a></code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/String_Functions#str">str</a></code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/String_Functions#chr">chr</a></code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/String_Functions#ord">ord</a></code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Other_Language_Features#Search">search</a></code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Other_Language_Features#OpenSCAD_Version">version</a></code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Other_Language_Features#OpenSCAD_Version">version_num</a></code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Other_Language_Features#parent_module.28n.29_and_.24parent_modules">parent_module</a>(idx)</code>
            </article>
            <article>
                <h2>Mathematical</h2>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Mathematical_Functions#abs">abs</a></code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Mathematical_Functions#sign">sign</a></code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Mathematical_Functions#sin">sin</a></code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Mathematical_Functions#cos">cos</a></code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Mathematical_Functions#tan">tan</a></code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Mathematical_Functions#acos">acos</a></code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Mathematical_Functions#asin">asin</a></code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Mathematical_Functions#atan">atan</a></code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Mathematical_Functions#atan2">atan2</a></code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Mathematical_Functions#floor">floor</a></code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Mathematical_Functions#round">round</a></code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Mathematical_Functions#ceil">ceil</a></code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Mathematical_Functions#ln">ln</a></code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Mathematical_Functions#len">len</a></code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Mathematical_Functions#let">let</a></code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Mathematical_Functions#log">log</a></code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Mathematical_Functions#pow">pow</a></code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Mathematical_Functions#sqrt">sqrt</a></code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Mathematical_Functions#exp">exp</a></code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Mathematical_Functions#rands">rands</a></code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Mathematical_Functions#min">min</a></code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Mathematical_Functions#max">max</a></code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Mathematical_Functions#norm">norm</a></code>
                <code><a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Mathematical_Functions#cross">cross</a></code>
            </article>
            </section>
                    
            <br clear="all">
            
            <section>
            <article class="info">
                <em>Links:</em>
                <a href="http://www.openscad.org/" target="_blank">Official website</a>
                | <a href="https://github.com/openscad/openscad" target="_blank">Code</a>
                | <a href="https://github.com/openscad/openscad/issues" target="_blank">Issues</a>
                | <a href="https://en.wikibooks.org/wiki/OpenSCAD_User_Manual" target="_blank">Manual</a>
                | <a href="https://github.com/openscad/MCAD" target="_blank">MCAD library</a>
                | <a href="http://forum.openscad.org/" target="_blank">Forum</a>
                | <a href="http://fablabamersfoort.nl/book/openscad" target="_blank">Other links</a>
            </article>
            </section>
        </section>
        
        <footer>
            <a href="https://github.com/openscad/openscad.github.com/tree/master/cheatsheet" target="_blank">Edit me on GitHub!</a><br>
            By <a href="http://www.peteruithoven.nl/" target="_blank">Peter Uithoven</a> @ <a href="http://www.fablabamersfoort.nl/" target="_blank">Fablab Amersfoort</a> (<a href="http://freedomdefined.org/Licenses/CC-BY" target="_blank">CC-BY</a>)
        </footer>
        
        </body></html>`
    }
}