# AI Assistant Guide for OpenSCAD Projects

This project is enhanced with the VS Code OpenSCAD extension, which provides powerful tools for analyzing and debugging `.scad` models. To interact with these features, you can use the file-based system described below.

---

### **Working with the Debug Directory**

The extension can generate a set of rich diagnostic and data files for any `.scad` model in this workspace. These files provide detailed, machine-readable information about the model's structure, dimensions, and appearance.

#### **1. Generating the Files**

To create or update the debug files for the currently open `.scad` document, ask the user to run the following command from the VS Code Command Palette:

**`OpenSCAD: Generate Debug Files for AI Assistant`**

Alternatively, these files can be configured to generate automatically whenever a `.scad` file is saved.

#### **2. Accessing the Files**

Once generated, the files are stored in a predictable directory structure within the `.openscad/` folder at the root of the workspace.

For a file located at `<project_root>/path/to/model.scad`, you can find its associated data files in:

**`<project_root>/.openscad/debug/path/to/model.scad/`**

#### **3. Available Files**

The following files will be available in the debug directory:

* **`dimensions.json`**: A JSON object containing the model's precise bounding box (in mm), volume (in cm³), and surface area (in cm²). **Use this for any measurement-related questions.**
* **`scene-graph.csg`**: The raw, complete scene graph of the model. This file describes the hierarchy and relationships of all geometric primitives.
* **`preview.png`**: A PNG image showing a rendered, auto-centered preview of the model. Use this for visual confirmation of the model's shape and appearance.
* **`model.stl`**: The final rendered model as an STL file.
* **`render.log`**: The captured `stdout` from the last OpenSCAD compilation, containing all `echo()` statements and general compiler messages.
* **`error.log`**: The captured `stderr` from the last compilation. **Check this file first if a compilation fails or produces unexpected results.**

---

### **Example Workflows**

#### **Example 1: Checking Dimensions**

**User:** "Check if the model in `my_robot.scad` is taller than 50mm."

**Your Thought Process:**
1.  The user is asking for a specific dimension. The `dimensions.json` file is the source of truth for this.
2.  The debug files for `my_robot.scad` should be located at `.openscad/debug/my_robot.scad/`.
3.  I need to read the file `.openscad/debug/my_robot.scad/dimensions.json`.
4.  If the file doesn't exist, I must ask the user to run the command **`OpenSCAD: Generate Debug Files for AI Assistant`** first.
5.  Once I have the file content, I will parse the JSON, find the `boundingBox_mm` array, and check the value at index 2 (the Z-axis/height).
6.  Finally, I will compare that value to 50 and answer the user's question.

---

#### **Example 2: Debugging a Compilation Error**

**User:** "My model isn't rendering and I don't know why. Can you fix it?"

**Your Thought Process:**
1.  A failed render means there's likely an error. The `error.log` file is the best place to find it.
2.  I will read the file `.openscad/debug/my_robot.scad/error.log`.
3.  The log contains the message: `Syntax error on line 25: unexpected token '$fn'`.
4.  I will then read the source file `my_robot.scad`, go to line 25, and look for the syntax error related to `$fn`.
5.  I can then suggest a correction to the user based on the error message.

---

#### **Example 3: Understanding Complex Code**

**User:** "In `my_robot.scad`, what is the final shape being created by the `difference()` at the top level?"

**Your Thought Process:**
1.  The user wants to understand the structure of the model. The `scene-graph.csg` file describes this structure explicitly.
2.  I will read the file `.openscad/debug/my_robot.scad/scene-graph.csg`.
3.  I will parse the CSG data and look for the top-level "root" node.
4.  I see the root node is a `difference`. I can describe its children to the user. For example: "The final shape is created by taking a large `intersection` of a cube and a cylinder, and then subtracting two smaller shapes from it: another cylinder (the groove) and a `rotate` operation containing the fan holes."

---

#### **Example 4: Verifying a Visual Change**

**User:** "I tried to add a bevel to the top edge of the robot's base. Did it work?"

**Your Thought Process:**
1.  The user is asking for visual confirmation. The `preview.png` image is the best tool for this.
2.  I will analyze the image file at `.openscad/debug/my_robot.scad/preview.png`.
3.  I will examine the image, looking for the part described as the "robot's base".
4.  I will check the top edges of that part in the image to see if they appear rounded or chamfered, consistent with a bevel.
5.  I will then report back to the user: "Yes, I can see in the preview image that the top edges of the base now have a distinct bevel."