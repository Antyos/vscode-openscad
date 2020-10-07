// Test file for SCAD customizer syntax
// Can match: [10], [10:20], [-10:0.2:10], [foo, bar, baz], [10:S, 20:M, 30:L], [S:Small, M:Medium, L:Large]

/* [Numerical Values] */
a = 5;      // [5]
b = 3;      // [ 10:20 ]
c = 1;      // [1 : 0.1 : 1.5]
d = 1;      // [-10:0.1:10]

/* [Values] [Text] */
e = "hi";   // [hi, hello, howdy, what's up, what:?!]
f = 10;     // [10:S, 20:M, 30:L]
g = "S";    // [S:Small, M*:Medium, L:Large]

// Not a valid category below
/* [
    abc
] */

h = "Ss";   // [Ss:Small, M m:Med i*um, X-L:Large]

/** [] */   // Blank content and/or two *'s works too
i = 20;     // [10, 20, 30, 	40]

echo(a,b,c,d,e,f,g,h,i);

// Only [a[Test] and [123] should be highlighted
/* aa] [a[Test]aa[123]aa] */

j = "This";
// [This, should, not, be, highlighted]

/* Below from: https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Customizer */

/* [Drop down box] */
// combo box for number
Numbers=2; // [0, 1, 2, 3]

// combo box for string
Strings="foo"; // [foo, bar, baz]

//labeled combo box for numbers
Labeled_values=10; // [10:S, 20:M, 30:L]

//labeled combo box for string
Labeled_value="S"; // [S:Small, M:Medium, L:Large]

/* [Slider] */
// slider widget for number with max. value
sliderWithMax =34; // [50]

// slider widget for number in range
sliderWithRange =34; // [10:100]

//step slider for number
stepSlider=2; //[0:5:100]

// slider widget for number in range
sliderCentered =0; // [-10:0.1:10]