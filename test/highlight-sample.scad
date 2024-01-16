// Test file for general highlighting
// exportNameFormat=${filenameNoExtension}.${exportExtension}
include <file1.scad>;
use <file2.scad>;

// Variables
/* [General] */
id = 8.2;
od = 12.5;
h = 30;
chamfer = [1.5, 2];     // Chamfer: [h-dist, v-dist]

/* [Gap] */
generate_gap = 1;       // [0:off, 1:slot, 2:fancy gap]
gap_split = .4;         // [foo]
gap_thickness = 1.6;    // [10]
gap_id_extra = 1.6;     // [1:10]
gap_width = 10;         // [-10:1:10]

/* [Knurls] */
knurl_depth = 0.5;
knurl_count = 20;

$fn=50;


// Generate pencil grip thing
difference()
{
    linear_extrude(h) difference()
    { 
        ring(od=od, id=id);
        if (generate_gap == 1) translate([-gap_split/2,0,0]) square([gap_split, od/2]);
        else if (generate_gap == 2) gap();
    }

    rot_chamfer(chamfer, od/2);
    translate([0,0,h]) mirror([0,0,1])
        rot_chamfer(chamfer, od/2);

    translate([0, 0, h/2])
    for (i = [0 : knurl_count])
    {
        rotate([0, 0, i * (360/knurl_count)])
        {
            mirror([0,0,1]) knurl_cut(h, od, 50);
            knurl_cut(h, od, 50);
        }
    }
}

// Sub-routines
module ring(od=0, id)
{
    difference()
    {
        circle(d=od);
        circle(d=id);
    }
}

module gap()
{
    difference()
    {
        ring(id+gap_id_extra+gap_thickness, id+gap_id_extra);
        translate([0,od/4,0]) square(size=[gap_width, od/2], center=true);
    }
    translate([0,-(id+gap_id_extra+gap_thickness)/4,0]) square(size=[gap_split, (id+gap_id_extra)/2], center=true);
}

module rot_chamfer(dist, r)
{
    buf = 0.5; // buffer value
    rotate_extrude()
    translate([-(r+buf/2), -buf, 0])
    polygon(points=[[0,0],[dist[0]+buf,0], [0,dist[1]+buf]]);
}

module knurl_cut(height, diameter, incline_angle=45)
{
    phi = 360 * (height/(diameter*PI))/tan(incline_angle); // linear extrude twist degrees
    //echo(phi);

    linear_extrude(height=height, convexity=10, center=true, twist=phi, slices=height) 
        {
            translate([od/2,0,0])  
            rotate(45) 
            square(size=knurl_depth*sqrt(2), center=true);    
        }
}

// Module without braces is still valid
module cir() circle(r=1);

function rad(degrees) = degrees/180*PI;
function deg(radians) = radians*180/PI;
