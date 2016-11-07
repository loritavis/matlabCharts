define([
    "./pickTicks"
], function (pickTicks) {
    "use strict";

    function VRuler() {
        var that = this;

        this.font = 'serif';
        this.fontSize = 12;
        this.lineColor = "black";
        this.textColor = "black";
        this.tickColor = "black";
        this.baseline = 0;
       // this.direction = 'normal';
        this.visible = true;

        this.labelPosition = "left";
        this.ticks = null;

        var screenRange = [1, 100];
        var dataRange = [0, 1];
        var treatDataAsTime = false;

        var tickValues = [0, 1];
        var tickLabels = ["Its", "Broken!"];
        var autoTicks = true;
        var encloseData = true;

        Object.defineProperty(this, 'screenRange', {
            get: function () {
                return screenRange;
            },
            set: function (value) {
                screenRange = value;
                that.pickTicksIf();
            }
        });

        Object.defineProperty(this, 'dataRange', {
            get: function () {
                return dataRange;
            },
            set: function (value) {
                dataRange = value;
                that.pickTicksIf();
            }
        });

        Object.defineProperty(this, 'tickValues', {
            get: function () {
                return tickValues;
            },
            set: function (value) {
                tickValues = value;
                autoTicks = false;
            }
        });

        Object.defineProperty(this, 'tickLabels', {
            get: function () {
                return tickLabels;
            },
            set: function (value) {
                tickLabels = value;
                autoTicks = false;
            }
        });

        Object.defineProperty(this, 'encloseData', {
            get: function () {
                return encloseData;
            },
            set: function (value) {
                encloseData = value;
            }
        });

        Object.defineProperty(this, 'treatDataAsTime', {
            get: function () {
                return treatDataAsTime;
            },
            set: function (value) {
                treatDataAsTime = value;
            }
        });

        this.pickTicksIf = function () {
            this.ticks = pickTicks(screenRange, dataRange, treatDataAsTime, encloseData);
        };

        this.draw = function (ctx) {
            var i, value, values, y;

            if (!this.visible) {
                return;
            }

            var labelOffset;
            if (this.labelPosition === "left") {
                ctx.textAlign = "right";
                labelOffset = -4;
            } else if (this.labelPosition === "right") {
                ctx.textAlign = "left";
                labelOffset = 4;
            }

            // draw baseline
            if (this.lineColor) {
                ctx.strokeStyle = this.lineColor;
                ctx.beginPath();
                ctx.moveTo(this.baseline, this.screenRange[0]);
                ctx.lineTo(this.baseline, this.screenRange[1]);
                ctx.stroke();
            }

            if (this.tickColor) {
                // draw ticks
                ctx.strokeStyle = this.tickColor;
                ctx.lineWidth = 1;
                ctx.beginPath();
                values = this.ticks.values;
                for (i = 0; i < values.length; i += 1) {
                    value = values.map(i);
                    y = 0.5 + Math.floor(this.ticks.dataToScreenMapper.map(value));
                    ctx.moveTo(this.baseline - 1, y);
                    ctx.lineTo(this.baseline + 2, y);
                }
                ctx.stroke();
            }

            // draw tick labels
            ctx.textBaseline = "middle";
            ctx.font = this.fontSize + "px " + this.font;
            ctx.fillStyle = this.textColor;
            ctx.beginPath();
            values = this.ticks.values;
            for (i = 0; i < values.length; i += 1) {
                value = values.map(i);
                y = 0.5 + Math.floor(this.ticks.dataToScreenMapper.map(value));
                ctx.fillText(this.ticks.labels.map(i), this.baseline + labelOffset, y);
            }
        };

        this.getRequiredWidth = function (context) {
            var width = 0;
            if (this.visible && this.fontSize > 0) {
                context.font = this.fontSize + "px " + this.font;
                var labels = this.ticks.labels;
                var i;
                for (i = 0; i < labels.length; i += 1) {
                    var metrics = context.measureText(labels.map(i));
                    if (metrics.width > width) {
                        width = metrics.width;
                    }
                }
                width += 4; // margins
            }
            return width;
        };

        this.pan = function (dyScreen) {
            var screenToData = (dataRange[1] - dataRange[0]) / (screenRange[1] - screenRange[0]);
            var dyData = dyScreen * screenToData;
            this.encloseData = false;
            this.dataRange = [dataRange[0] - dyData, dataRange[1] - dyData];
        };

        this.zoom = function (fixedScreenPoint, scale) {
            var screenFraction = (fixedScreenPoint - screenRange[0]) / (screenRange[1] - screenRange[0]);
            var fixedDataPoint = dataRange[0] + screenFraction * (dataRange[1] - dataRange[0]);

            var newBelow = (fixedDataPoint - dataRange[0]) * scale;
            var newAbove = (dataRange[1] - fixedDataPoint) * scale;

            this.dataRange = [fixedDataPoint - newBelow, fixedDataPoint + newAbove];
        };

        this.map = function (value) {
            return this.ticks.dataToScreenMapper.map(value);
        };

        this.reverseMap = function (value) {
            var fraction = (value - screenRange[0]) / (screenRange[1] - screenRange[0]);
            if (encloseData) {
                var tv = this.ticks.values;
                return tv.map(0) + fraction * (tv.map(tv.length - 1) - tv.map(0));
            }
            return dataRange[0] + fraction * (dataRange[1] - dataRange[0]);
        };

        Object.seal(this);
    }

    return VRuler;
});