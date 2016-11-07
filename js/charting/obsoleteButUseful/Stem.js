/**
 * @module core/glyphs
 */
define([], function(){
    "use strict";

    function Stem(configuration) {
        var width = 1;
        var color = 'black';
        var base = 0;

        this.draw = function(context, x, y, xMapper, yMapper) {
            var i;
            context.beginPath();
            for (i = 0; i < x.length; i++) {
                context.moveTo(xMapper.map(x[i]), yMapper.map(base));
                context.lineTo(xMapper.map(x[i]), yMapper.map(y[i]));
            }
            context.strokeStyle = color;
            context.lineWidth = width;
            context.stroke();
        };

        Object.defineProperty(this, "width", {
            get: function() {
                return width;
            },
            set: function(input) {
                width = input;
            }
        });

        Object.defineProperty(this, "color", {
            get: function() {
                return color;
            },
            set: function(input) {
                color = input;
            }
        });

        Object.defineProperty(this, "base", {
            get: function() {
                return base;
            },
            set: function(input) {
                base = input;
            }
        });

        Object.seal(this);

        if (configuration) {
            SafeApply(this, configuration);
        }
    }

    return Stem;
});

/*
function make(table, glyphName, map) {
    "use strict";
    var glyph = new glyphName();
    map.forEach(function (key) {
        var variableName = map[key];
        var column = table.getCol(variableName);
        glyph.configuration[key] = map[key];
    });
    return glyph;
}


function Stem(table, config) {
    "use strict";
    var glyph = new StemGlyph(table, config);

    var axis = new Axis();
    axis.add(glyph)
    return axis;
}
*/