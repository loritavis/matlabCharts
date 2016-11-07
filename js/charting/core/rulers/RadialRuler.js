define([], function () {
    "use strict";

    function RadialRuler(centerX, centerY, radius) {
        this.centerX = centerX;
        this.centerY = centerY;
        this.radius = radius;

        this.labelRadius = this.radius - 25;
        this.lineColor = 'black';
        this.lineWidth = 1;

        this.tickColor = 'black';
        this.tickIn = 5;
        this.tickOut = 5;

        this.minorTicks = null;
        this.minorTickColor = 'black';
        this.minorTickIn = 2;
        this.minorTickOut = 2;

        this.tickLabelColor = 'black';
        this.tickLabelFont = '22px serif';

        var pi = 3.14159;
        var minValue = 0;
        var maxValue = 100;
        var minAngle = 0.5 * pi + 1;
        var maxAngle = 2.5 * pi - 1;
        var scale = 1;
        var offset = 0;
        var ticks = [0, 1];
        var tickLabels = ["0", "1"];

        Object.defineProperty(this, "ticks", {
            get: function () {
                return ticks;
            },
            set: function (newValue) {
                ticks = newValue;
                tickLabels = [];
                var i;
                for (i = 0; i < ticks.length; i += 1) {
                    tickLabels.push(ticks[i].toString());
                }
            }
        });

        // If I have a parent, tell him to redraw me.
        function reDraw() {
            //if (this.parent) {
            //parent.reDraw(thisGauge);
            //}
        }

        // PRIVATE functions
        function reScale() {
            scale = (maxAngle - minAngle) / (maxValue - minValue);
            offset = minAngle - minValue * scale;
            reDraw();
        }

        reScale();

        this.setSize = function (x, y, r) {
            this.centerX = x;
            this.centerY = y;
            this.radius = r;
            //this.tickLabelFont = Math.round(r / 5) + 'px Times New Roman';
            this.labelRadius = this.radius - r / 6 - 8;
        };

        this.setAngle = function (min, max) {
            minAngle = min;
            maxAngle = max;
            reScale();
        };

        this.setRange = function (lower, upper) {
            minValue = lower;
            maxValue = upper;
            reScale();
        };

        this.valueToAngle = function (value) {
            return value * scale + offset;
        };

        this.angleToValue = function (angle) {
            if (angle < minAngle) {
                angle = angle + 2 * Math.PI;
            }
            if (angle > maxAngle) {
                angle = angle - 2 * Math.PI;
            }

            return (angle - offset) / scale;
        };

        this.draw = function (context) {
            var i, angle, sin, cos;

            // baseline
            if (this.lineColor) {
                context.strokeStyle = this.lineColor;
                context.lineWidth = this.lineWidth;
                context.beginPath();
                context.arc(this.centerX, this.centerY, this.radius, minAngle, maxAngle, false);
                context.stroke();
            }

            // ticks
            if (this.ticks && this.tickColor) {
                context.strokeStyle = this.tickColor;
                context.lineWidth = 2;
                for (i = 0; i < ticks.length; i += 1) {
                    angle = this.valueToAngle(ticks[i]);
                    sin = Math.sin(angle);
                    cos = Math.cos(angle);
                    context.beginPath();
                    context.moveTo(this.centerX + (this.radius - this.tickIn) * cos,
                            this.centerY + (this.radius - this.tickIn) * sin);
                    context.lineTo(this.centerX + (this.radius + this.tickOut) * cos,
                            this.centerY + (this.radius + this.tickOut) * sin);
                    context.stroke();
                }
            }

            // minor ticks
            if (this.minorTicks) {
                context.strokeStyle = this.minorTickColor;
                context.lineWidth = 1;
                for (i = 0; i < this.minorTicks.length; i += 1) {
                    angle = this.valueToAngle(this.minorTicks[i]);
                    sin = Math.sin(angle);
                    cos = Math.cos(angle);
                    context.beginPath();
                    context.moveTo(this.centerX + (this.radius - this.minorTickIn) * cos,
                            this.centerY + (this.radius - this.minorTickIn) * sin);
                    context.lineTo(this.centerX + (this.radius + this.minorTickOut) * cos,
                            this.centerY + (this.radius + this.minorTickOut) * sin);
                    context.stroke();
                }
            }

            // tick labels
            if (tickLabels) {
                context.fillStyle = this.tickLabelColor;
                context.font = this.tickLabelFont;
                context.textAlign = "center";
                context.textBaseline = "middle";

                for (i = 0; i < tickLabels.length; i += 1) {
                    angle = this.valueToAngle(tickLabels[i]);
                    sin = Math.sin(angle);
                    cos = Math.cos(angle);
                    context.fillText(tickLabels[i], this.centerX + this.labelRadius * cos,
                            this.centerY + this.labelRadius * sin);
                }
            }

        };

    }

    return RadialRuler;
});
