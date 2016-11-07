/**
 * @module core/glyphs
 */
define([
    "../utilities/SafeApply"
], function(SafeApply) {
    "use strict";

    function Line(configuration) {
        var width = 1;
        var color = 'black';

        this.draw = function(context, xSource,ySource) {
            var i;
            context.beginPath();
            context.moveTo(xSource.map(0), ySource.map(0));
            for (i = 1; i < xSource.length; i++) {
                context.lineTo(xSource.map(i), ySource.map(i));
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
                width = input ;
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

        Object.seal(this);

        if (configuration) {
            SafeApply(this, configuration);
        }

    }

    return Line;

});
