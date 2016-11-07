/**
 * @module core/glyphs
 */
define([
    "../utilities/SafeApply",
    "../utilities/Mapper"
], function(SafeApply, Map) {
    "use strict";

    // Each marker type has an array of x and y points in the unit square.
    var markers = {};
    markers.square = {
        "x": [ -1, 1, 1, -1 ],
        "y": [ -1, -1, 1, 1 ]
    };

    markers.circle = {
        "x": []
    };

    markers.diamond = {
        "x": [ -1, 0, 1, 0 ],
        "y": [ 0, 1, 0, -1 ]
    };

    markers.upTriangle = {
        "x": [ 0, 1, -1 ],
        "y": [ -1, 1, 1 ]
    };

    markers.downTriangle = {
        "x": [ 0, 1, -1 ],
        "y": [ 1, -1, -1 ]
    };

    markers.leftTriangle = {
        "x": [ -1, 1, 1 ],
        "y": [ 0, 1, -1 ]
    };

    markers.rightTriangle = {
        "x": [ -1, -1, 1 ],
        "y": [ -1, 1, 0 ]
    };

    markers.pentagram = {
        "x": [ (7.0 / 25), 1, (2.0 / 5), (16.0 / 25), 0, -(16.0 / 25),
               -(2.0 / 5), -1, -(7.0 / 25), 0 ],
        "y": [ -(7.0 / 24), -(7.0 / 24), (7.0 / 25), 1, (14.0 / 25), 1,
               (7.0 / 25), -(7.0 / 24), -(7.0 / 24), -1 ]
    };

    markers.hexagram = {
        "x": [ 0, (8.0 / 23), 1, (14.0 / 23), 1, (8.0 / 23), 0, -(8.0 / 23),
               -1, -(14.0 / 23), -1, -(8.0 / 23) ],
        "y": [ 1, (1.0 / 2), (1.0 / 2), 0, -(1.0 / 2), -(1.0 / 2), -1,
               -(1.0 / 2), -(1.0 / 2), 0, (1.0 / 2), (1.0 / 2) ]
    };

    markers.map = function(data, names) {
        if (!names) {
            names = ["square", "diamond", "upTriangle", "downTriangle", "leftTriangle", "rightTriangle", "pentagram", "hexagram"];
        }
        return Map.Compound(Map.Map(data, names), Map.Index(markers));
    };

    function Marker(configuration) {
        var shape = Map.Constant(markers.diamond);
        var size = Map.Constant(4);
        var edgeColor = Map.Constant("#000");
        var faceColor = Map.Constant("green");

        function assureSource(thing){
            if(thing.map){
                return thing;
            }else{
                return Map.Constant(thing);
            }
        }

        Object.defineProperty(this, "shape", {
            get: function() {
                return shape;
            },
            set: function(newValue) {
                shape = assureSource(markers[newValue]);
            }
        });

        Object.defineProperty(this, "size", {
            get: function() {
                return size;
            },
            set: function(newValue) {
                size = assureSource(newValue);
            }
        });

        Object.defineProperty(this, "edgeColor", {
            get: function() {
                return edgeColor;
            },
            set: function(newValue) {
                edgeColor = assureSource(newValue);
            }
        });

        Object.defineProperty(this, "faceColor", {
            get: function() {
                return faceColor;
            },
            set: function(newValue) {
                faceColor = assureSource(newValue);
            }
        });

        function pathMarker(context, x, y, marker, markerSize) {
            var mx = marker.x;
            var my = marker.y;
            context.moveTo(x + mx[0] * markerSize, y + my[0] * markerSize);
            var i;
            for (i = 1; i < mx.length; i += 1) {
                context.lineTo(x + mx[i] * markerSize, y + my[i] * markerSize);
            }
            context.lineTo(x + mx[0] * markerSize, y + my[0] * markerSize);
        }

        this.draw = function(context, xSource,ySource) {
            var i;
            context.beginPath();
            for (i = 0; i < xSource.length; i += 1) {
                pathMarker(context, xSource.map(i), ySource.map(i), shape.map(i), size.map(i));
            }

            //TODO these can only be outside of the loop if these mappers are constant.
            // They are slow inside the loop so we need to do the right thing.
            if (faceColor) {
                context.fillStyle = faceColor.map(0);
                context.fill();
            }
            if (edgeColor) {
                context.strokeStyle = edgeColor.map(0);
                context.stroke();
            }
        };

        if (configuration) {
            SafeApply(this, configuration);
        }
    }

    return Marker;
});

