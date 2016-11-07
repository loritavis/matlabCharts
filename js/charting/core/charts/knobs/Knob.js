/**
 @module core/charts
 */
define([
    "../knobs/Bezel",
    "../../rulers/RadialRuler",
    "../knobs/Needle",
    "../base/Chart"
], function (Bezel, RadialRuler, Needle, Chart) {
    "use strict";

    /**
     @class Knob
     */
    function Knob() {
        Chart.apply(this);
        var that = this;

        var value = 70;
        var startingValue = 0;
        var endingValue = 100;

        Object.defineProperty(this, "value", {
            get: function () {
                return value;
            },
            set: function (newValue) {
                value = Math.max(startingValue, Math.min(endingValue, newValue));
                this.redraw();

                if (typeof that.onChange === 'function') {
                    that.onChange(value);
                }
            }
        });

        Object.defineProperty(this, "startingValue", {
            get: function () {
                return startingValue;
            },
            set: function (newValue) {
                startingValue = newValue;
                value = Math.max(startingValue, value);
                this.redraw();
            }
        });

        Object.defineProperty(this, "endingValue", {
            get: function () {
                return endingValue;
            },
            set: function (newValue) {
                endingValue = newValue;
                value = Math.min(endingValue, value);
                this.redraw();
            }
        });

        //TODO: automatically calculate colors from knobColorRGB
        /*
         this.setColor = function (color) {
         var knobColorRGB = Color.parseColor(color);
         // many colors are functions of the base knob color
         this.knobColor = color;
         var ringDark = Color.lighter(knobColorRGB, -5.5);
         var ringLight = Color.lighter(knobColorRGB, -0.3);
         var faceDark = Color.lighter(knobColorRGB, -1.2);

         };
         */

        var ruler = new RadialRuler(200, 200, 120);
        ruler.setRange(startingValue, endingValue);
        ruler.ticks = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
        ruler.minorTicks = [5, 15, 25, 35, 45, 55, 65, 75, 85, 95];
        ruler.tickLabels = ['0', '10', '20', '30', '40', '50', '60', '70', '80', '90', '100'];

        var rulerColor = '#555';

        ruler.lineColor = null;
        ruler.tickColor = rulerColor;
        ruler.tickIn = 0;
        ruler.tickOut = 8;

        ruler.minorTickColor = rulerColor;
        ruler.minorTickIn = 0;
        ruler.minorTickOut = 5;

        ruler.tickLabelColor = rulerColor;

        this.draw = function (context) {
            var radius = Math.min(this.width, this.height) / 2;
            var centerX = this.x + this.width / 2;
            var centerY = this.y + this.height / 2;
            var rOuter = radius * 0.70;
            var rInner = radius * 0.63;

            ruler.setSize(centerX, centerY, 0.75 * radius);
            ruler.labelRadius = 0.95 * radius;
            ruler.tickOut = 0.1 * radius;
            ruler.minorTickOut = 0.05 * radius;

            // the outer ring
            var gradient = context.createLinearGradient(0, centerY - rOuter, 0, centerY + rOuter);
            gradient.addColorStop(0.1, '#cfcfcf');
            gradient.addColorStop(0.9, '#111');
            context.fillStyle = gradient;

            context.beginPath();
            context.arc(centerX, centerY, rOuter, 0, 6.29, false);
            context.shadowColor = "black";
            context.shadowBlur = 5;
            context.shadowOffsetX = 0;
            context.shadowOffsetY = 5;

            context.fill();

            context.shadowColor = null;
            context.shadowBlur = 0;
            context.shadowOffsetX = 0;
            context.shadowOffsetY = 0;

            // the inner ring
            gradient = context.createLinearGradient(0, centerY - rInner, 0, centerY + rInner);
            gradient.addColorStop(0.0, '#aaa');
            gradient.addColorStop(1, '#555');
            context.fillStyle = gradient;

            context.beginPath();
            context.arc(centerX, centerY, rInner, 0, 6.29, false);
            context.fill();

            // the indicator
            var angle = ruler.valueToAngle(value);
            var sa = Math.sin(angle);
            var ca = Math.cos(angle);
            var r1 = 15;
            var r2 = rInner * 0.95;

            // line
            context.beginPath();
            context.moveTo(centerX + r1 * ca, centerY + r1 * sa);
            context.lineTo(centerX + r2 * ca, centerY + r2 * sa);
            context.strokeStyle = '#eee';
            context.lineWidth = 4;
            context.stroke();

            // end balls
            context.beginPath();
            context.moveTo(centerX + r1 * ca, centerY + r1 * sa);
            context.arc(centerX + r1 * ca, centerY + r1 * sa, 2, 0, 6.29, false);
            context.moveTo(centerX + r2 * ca, centerY + r2 * sa);
            context.arc(centerX + r2 * ca, centerY + r2 * sa, 2, 0, 6.29, false);
            context.fillStyle = '#eee';
            context.fill();

            ruler.draw(context);
        };

        this.eventHandler = this;
        this.mouseDragHandler = function (event) {
            var centerX = this.x + this.width / 2;
            var centerY = this.y + this.height / 2;
            var x = event.x - centerX;
            var y = event.y - centerY;
            var angle = Math.atan2(y, x);

            this.value = ruler.angleToValue(angle);
        };

        // Event thrown when knob changed.
        this.onChange = null;

        Object.seal(this);
    }

    Knob.prototype = Object.create(Chart.prototype);
    return Knob;
});
