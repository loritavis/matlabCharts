/*
 So, you have a horizontal row of strings to draw. This guy will draw them for you.
 He will draw them in a row, staggered, slanted, or not at all, depending on how much room there is.
 */

define([], function () {
    "use strict";

    function TextRow(stringSource, xSource, y) {
        this.font = 'serif';
        this.fontSize = 12;
        this.textColor = "black";
        this.position = "below"; // TODO No effect yet...

        this.positionSource = xSource;
        this.y = y;

        var labelSource = stringSource;
        var stringWidths = null;

        Object.defineProperty(this, 'labelSource', {
            get: function () {
                return labelSource;
            },
            set: function (source) {
                labelSource = source;
                stringWidths = null;
            }
        });

// do the strings not bump into each other?
        function canDrawFlat(xCenters, widths) {
            var margin = 0.1; // 10% margin required between strings
            var i;
            for (i = 1; i < xCenters.length; i += 1) {
                var distanceBetweenTicks = Math.abs(xCenters.map(i) - xCenters.map(i - 1));
                var distanceForStrings = (widths[i] + widths[i - 1]) / 2;
                if (distanceBetweenTicks < distanceForStrings * (1 + margin)) {
                    return false;
                }
            }
            return true;
        }

        function drawFlat(context, strings, xCenters, y) {
            context.textAlign = "center";
            context.textBaseline = "top";
            var i;
            for (i = 0; i < strings.length; i += 1) {
                context.fillText(strings.map(i), xCenters.map(i), y);
            }
        }

        // do strings not extend past midpoint of neighbor strings?
        function canDrawStaggered(xCenters, widths) {
            var i;
            for (i = 1; i < (xCenters.length - 1); i += 1) {
                var leftGap = xCenters.map(i) - xCenters.map(i - 1);
                var leftString = widths[i - 1] / 2;
                if (leftString >= leftGap) {
                    return false;
                }
                var rightGap = xCenters[i + 1] - xCenters.map(i);
                var rightString = widths[i + 1] / 2;
                if (rightString >= rightGap) {
                    return false;
                }
            }
            return true;
        }

        function drawStaggered(context, strings, xCenters, y, fontSize) {
            context.textAlign = "center";
            context.textBaseline = "top";
            context.beginPath();
            var i;
            for (i = 0; i < strings.length; i += 1) {
                if (0 === i % 2) {
                    context.fillText(strings.map(i), xCenters.map(i), y);
                } else {
                    context.moveTo(xCenters.map(i), y);
                    context.lineTo(xCenters.map(i), y + fontSize);
                    context.fillText(strings.map(i), xCenters.map(i), y + fontSize);
                }
            }
            context.stroke();
        }

        // is there room for vertical strings between ticks?
        function canDrawSlanted(xCenters, fontSize) {
            var gap = xCenters.map(1) - xCenters.map(0);
            return fontSize * 0.8 <= gap;
        }

        function drawSlanted(context, strings, xCenters, y, fontSize) {
            context.textAlign = "left";
            context.textBaseline = "middle";
            var gap = xCenters.map(1) - xCenters.map(0);
            var angle = Math.asin(Math.min(1, fontSize / gap));
            var i;
            for (i = 0; i < strings.length; i += 1) {
                context.translate(xCenters.map(i), y);
                context.rotate(angle);
                context.fillText(strings.map(i), 0, 0);
                context.rotate(-angle);
                context.translate(-xCenters.map(i), -y);
            }
        }


        this.draw = function (context) {
            context.font = this.fontSize + "px " + this.font;
            context.fillStyle = this.textColor;
            context.strokeStyle = this.textColor;

            var widths = this.getWidths(context);

            if (canDrawFlat(this.positionSource, widths)) {
                drawFlat(context, labelSource, this.positionSource, this.y);
            } else if (canDrawStaggered(this.positionSource, widths)) {
                drawStaggered(context, labelSource, this.positionSource, this.y, this.fontSize);
            } else if (canDrawSlanted(this.positionSource, this.fontSize)) {
                drawSlanted(context, labelSource, this.positionSource, this.y, this.fontSize);
            } // else don't draw  TODO: decimate when too tight...
        };

        this.getPreferredHeight = function (context) {

            var widths = this.getWidths(context);

            if (canDrawFlat(this.positionSource, widths)) {
                return this.fontSize;
            }
            if (canDrawStaggered(this.positionSource, widths)) {
                return 2 * this.fontSize;
            }
            if (canDrawSlanted(this.positionSource, this.fontSize)) {
                var gap = this.positionSource.map(1) - this.positionSource.map(0);
                var angle = Math.asin(Math.min(1, this.fontSize / gap));
                return Math.sin(angle) * Math.max.apply(null, widths);
            }

            return 0;
        };

        // measure the width of each string
        this.getWidths = function (context) {
            if (stringWidths === null) {
                stringWidths = new Array(labelSource.length);
                var i;
                for (i = 0; i < labelSource.length; i += 1) {
                    var metrics = context.measureText(labelSource.map(i));
                    stringWidths[i] = metrics.width;
                }
            }
            return stringWidths;
        };

        Object.seal(this);
    }

    return TextRow;
});
