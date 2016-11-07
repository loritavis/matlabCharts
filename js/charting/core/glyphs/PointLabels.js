/**
 * @module core/glyphs
 */
define([
    "../utilities/SafeApply",
    "../utilities/color/Color"
], function(safeApply, Color) {
    "use strict";

    function PointLabels(configuration) {
        var font = "sans-serif";
        var fontSize = 12;

        this.xLabelSource = null;
        this.yLabelSource = null;

        this.draw = function(context, xSource,ySource) {
            var i;

            var dx = Math.abs(xSource.map(0) - xSource.map(1));

            if (dx > 20) {
                // these colors fade in as dx increases
                var textColor = Color.mixColor(255, 255, 255, 0, 0, 0, 0, 1, 20, dx, 60);
                context.fillStyle   = textColor;
                context.strokeStyle = textColor;
                context.font = fontSize + "px " + font;

                for (i = 0; i < xSource.length; i += 1) {
                    var xScreen = xSource.map(i);
                    var yScreen = ySource.map(i);

                    var label = this.xLabelSource.map(i);
                    context.textAlign = "center";
                    context.textBaseline = "bottom";
                    context.fillText(label, xScreen, yScreen - 10);

                    label = this.yLabelSource.map(i);
                    context.textAlign = "left";
                    context.textBaseline = "middle";
                    context.fillText(label, xScreen + 12, yScreen);

                    context.beginPath();
                    context.moveTo(xScreen, yScreen - 10);
                    context.lineTo(xScreen, yScreen - 3);
                    context.moveTo(xScreen + 3, yScreen);
                    context.lineTo(xScreen + 10, yScreen);
                    context.stroke();
                }
            }
        };

        Object.defineProperty(this, "font", {
            get: function() {
                return font;
            },
            set: function(input) {
                font = input;
            }
        });

        Object.defineProperty(this, "fontSize", {
            get: function() {
                return fontSize;
            },
            set: function(input) {
                fontSize = input;
            }
        });

        Object.seal(this);
        if (configuration) {
            SafeApply(this, configuration);
        }

    }

    return PointLabels;
});

