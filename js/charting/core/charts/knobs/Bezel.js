define([
    "../../utilities/color/Color"
], function (Color) {
    "use strict";
    function Bezel(x, y, r) {

        // private properties
        var centerX = x;
        var centerY = y;
        var radius = r;

        var knobColor;
        var knobColorRGB;
        var bandDark;
        var bandLight;
        var faceShadow;

        // public methods
        // functions
        this.setSize = function (x, y, r) {
            centerX = x;
            centerY = y;
            radius = r;
        };

        this.setColor = function (color) {
            knobColorRGB = Color.parseColor(color);
            // many colors are functions of the base knob color
            knobColor = color;
            bandDark = Color.lighter(knobColorRGB, -5.5);
            bandLight = Color.lighter(knobColorRGB, -0.3);
            faceShadow = Color.lighter(knobColorRGB, -1.2);
        };

        function gradientCircle(context, x, y, r, cTop, cBottom) {
            var gradient = context.createLinearGradient(0, y - r, 0, y + r);
            gradient.addColorStop(0, cTop);
            gradient.addColorStop(1, cBottom);
            context.fillStyle = gradient;
            context.beginPath();
            context.arc(x, y, r, 0, 6.29, false);
            context.fill();
        }

        this.draw = function (context) {
            // the outer band
            context.shadowColor = "black";
            context.shadowBlur = 8;
            context.shadowOffsetX = 0;
            context.shadowOffsetY = 3;

            gradientCircle(context, centerX, centerY, radius, bandLight, bandDark);

            context.shadowColor = null;
            context.shadowBlur = 0;
            context.shadowOffsetX = 0;
            context.shadowOffsetY = 0;

            // the inner band
            gradientCircle(context, centerX, centerY, radius * 0.97, bandDark, bandLight);

            // the background
            gradientCircle(context, centerX, centerY, radius * 0.94, faceShadow, knobColor);

            var gradient = context.createRadialGradient(centerX, centerY, 0, centerX,
                    centerY, radius);
            gradient.addColorStop(0.75, 'rgba(' + knobColorRGB[0] + ',' + knobColorRGB[1] + ',' + knobColorRGB[2] + ',1.0)');
            gradient.addColorStop(0.90, 'rgba(' + knobColorRGB[0] + ',' + knobColorRGB[1] + ',' + knobColorRGB[2] + ',0.0)');
            context.fillStyle = gradient;
            context.beginPath();
            context.arc(centerX, centerY, radius, 0, 6.29, false);
            context.fill();
        };

        this.setColor('#bbb');
    }

    return Bezel;
});