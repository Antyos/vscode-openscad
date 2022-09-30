module cube(size, center=false){}
module sphere(r=0, d=0, $fa=0,$fs=0, $fn=0){}
module cylinder($fn = 0, $fa = 12, $fs = 2, h = 1, r1 = 1, r2 = 1, center = false, d1=2, d2=2, r=1, d=1){}
module polyhedron(points=undef, faces=undef, triangles=undef, convexity=1){}

module square(size=[1,1], center=false){};
module circle($fn = 0, $fa = 12, $fs = 2, r = 1){}
module polygon(points = undef, paths = undef, convexity = 1){}
module import_dxf(file, layer){}
module import(file, convexity=undef, layer=undef, origin=undef, $fn=undef, $fa=undef, $fs=undef){}
module text(test, size=undef, font=undef, halign=undef, valign=undef, spacing=undef, direction=undef, language=undef, script=undef, $fn=undef){}
module projection(cut=false){}
module linear_extrude(height = undef, center = false, convexity = undef, twist = undef, $fn = undef, scale=undef){}
module rotate_extrude(convexity=undef, angle=undef, $fa=undef, $fs=undef, $fn=undef){}

module scale(v){}
module resize(newsize, auto=undef){}
module rotate(a, v=undef){}
module translate(v){}
module mirror(v){}
module multmatrix(m){}
module color(c, alpha=1.0){}
module offset(r=undef, delta=undef, chamfer=undef){}
module minkowski(){}
module hull(){}

// boolean combinations
module union(){}
module difference(){}
module intersection(){}
module render(convexity=1){}