// Mathematical cosine function
function cos(degrees)=0;

// Mathematical sine function. 
function sin(degrees)=0;

// Mathematical tangent function.
function tan(degrees)=0;

// Mathematical arccosine, or inverse cosine, expressed in degrees. 
function acos(value)=0;

// Mathematical arcsine, or inverse sine, expressed in degrees.
function asin(value)=0;

// Mathematical arctangent, or inverse tangent, function. Returns the principal value of the arc tangent of x, expressed in degrees.
function atan(value)=0;

// Mathematical two-argument atan function atan2(y,x) that spans the full 360 degrees. 
// This function returns the full angle (0-360) made between the x axis and the vector(x,y) 
// expressed in degrees. atan can not distinguish between y/x and -y/-x and returns angles from -90 to +90
function atan2(y,x)=0;

// Mathematical absolute value function. Returns the positive value of a signed decimal number. 
function abs(value)=0;

// Mathematical ceiling function.
// Returns the next highest integer value by rounding up value if necessary. 
function ceil(value)=0;

// Return a new vector that is the result of appending the elements of the supplied vectors. 
function concat(values)=0; //varargs

// Calculates the cross product of two vectors in 3D or 2D space. 
function cross(value)=0;

// Mathematical exp function. Returns the base-e exponential function of x, which is the number e raised to the power x.
function exp(value)=0;


// Mathematical floor function. floor(x) = is the largest integer not greater than x 
function floor(value)=0;

// Mathematical natural logarithm.
function ln(value)=0;

// Mathematical length function. Returns the length of an array, a vector or a string parameter. 
function len(value)=0;

// let(): this is built into the grammar

// Mathematical logarithm to the base 10. Example: log(1000) = 3. 
function log(value)=0;

// Look up value in table, and linearly interpolate if there's no exact match. The first argument is the value to look up. The second is the lookup table -- a vector of key-value pairs. 
function lookup(p,table)=0;

// Returns the maximum of the parameters. If a single vector is given as parameter, returns the maximum element of that vector. 
function max(n)=0; // varargs

// Returns the minimum of the parameters. If a single vector is given as parameter, returns the minimum element of that vector. 
function min(value)=0; // varargs

// Returns the euclidean norm of a vector.
function norm(value)=0;

// Mathematical power function. As of version 2021.01 you can use the exponentiation operator ^ instead. 
function pow(value)=0;

// Random number generator. Generates a constant vector of pseudo random numbers, much like an array. The numbers are doubles not integers. 
function rand(min_value, max_value, value_count, seed_value)=0;

// The "round" operator returns the greatest or least integer part, respectively, if the numeric input is positive or negative. 
function round(value)=0;

// Mathematical signum function. Returns a unit value that extracts the sign of a value
function sign(value)=0;

// Mathematical square root function.
function sqrt(value)=0;
