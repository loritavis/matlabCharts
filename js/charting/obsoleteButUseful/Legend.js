define([
    "../core/utilities/Really"
], function (really) {
    "use strict";

    function Legend(aChart) {

        var x = 200;
        var y = 100;
        var width = 100;
        var height = 100;

        var backgroundColor = "#eef";
        var edgeColor = "#00e";

        this.draw = function (context) {
            context.fillStyle = backgroundColor;
            context.strokeStyle = edgeColor;
            context.fillRect(x, y, width, height);
            context.strokeRect(x, y, width, height);

            // How shall a legend learn of the legendable elements in the chart?
            var lines = aChart.getLines();
            Really.assert(lines, "Legend could not get lines from its chart");

            var space = height / lines.length;
            var i;
            for (i = 0; i < lines.length; i += 1) {
                var line = lines[i];
                var yLine = y + space / 2 + i * space;

                // Do we draw the glyph here, using the elements properties
                // or should the element draw itself.
                // if data could easily be swapped out, the object could draw here???
                context.moveTo(x + 2, yLine);
                context.lineTo(x + width - 12, yLine);
                context.linewidth = line.lineWidth;
                context.strokeStyle = line.lineColor;
                context.stroke();

                // Where should the labels for lines come from -> their underlying table column!
                context.fillText("line " + i, x + width - 10, y);
            }
        };

        Object.seal(this);
    }

    return Legend;
});
