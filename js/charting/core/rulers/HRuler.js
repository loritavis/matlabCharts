define([
    "../utilities/Mapper",
    "./pickTicks",
    "./DateTickPicker",
    "./TextRow"
], function (Mapper, pickTicks, DatePicker, TextRow) {
    "use strict";

    function HRuler() {

        this.font = 'serif';
        this.textColor = "black";

        this.lineColor = "black";
        this.tickColor = "black";

        this.visible = true;

        this.labelPosition = "below";
        this.ticks = null;

        var screenRange = [1, 100];
        var dataRange = [0, 1];
        var baseline = 0;
        var treatDataAsTime = false;

        var tickValues = null;
        var tickLabels = null;

        var autoTicks = true;
        var encloseData = true;

        var xCenters = null;
        var textRow = new TextRow();

        var this2 = this;

        Object.defineProperty(this, 'screenRange', {
            get: function () {
                return screenRange;
            },
            set: function (value) {
                screenRange = value;
                this2.pickTicksIf();
            }
        });

        Object.defineProperty(this, 'dataRange', {
            get: function () {
                return dataRange;
            },
            set: function (value) {
                dataRange = value;
                this2.pickTicksIf();
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

        Object.defineProperty(this, 'fontSize', {
            get: function () {
                return textRow.fontSize;
            },
            set: function (value) {
                textRow.fontSize = value;
            }
        });

        Object.defineProperty(this, 'baseline', {
            get: function () {
                return baseline;
            },
            set: function (value) {
                baseline = value;
                textRow.y = this.baseline + 2;
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
            if (autoTicks) {
                this.ticks = pickTicks(screenRange, dataRange, treatDataAsTime,
                        encloseData);
            }

            xCenters = Mapper.Compound(this.ticks.values, this.ticks.dataToScreenMapper);
            textRow.labelSource = this.ticks.labels;
            textRow.positionSource = xCenters;
        };

        this.draw = function (context) {
            if (this.visible) {
                this.drawTicks(context);
                textRow.draw(context);
            }
        };

        this.drawTicks = function (context) {
            if (this.lineColor) {
                context.strokeStyle = this.lineColor;
                context.beginPath();
                context.moveTo(screenRange[0], this.baseline);
                context.lineTo(screenRange[1], this.baseline);
                context.stroke();
            }

            // ticks
            if (this.tickColor) {
                context.beginPath();
                var i;
                for (i = 0; i < xCenters.length; i += 1) {
                    var x = 0.5 + Math.floor(xCenters.map(i));
                    context.moveTo(x, this.baseline - 1);
                    context.lineTo(x, this.baseline + 2);
                }
                context.strokeStyle = this.tickColor;
                context.lineWidth = 1;
                context.stroke();
            }
        };

        this.getRequiredHeight = function (context) {
            var h = textRow.getPreferredHeight(context);
            if (h !== 0) {
                h += 5;
            }
            return h;
        };

        this.pan = function (dxScreen) {
            var screenToData = (dataRange[1] - dataRange[0]) / (screenRange[1] - screenRange[0]);
            var dxData = dxScreen * screenToData;
            encloseData = false;
            this.dataRange = [dataRange[0] - dxData, dataRange[1] - dxData];
        };

        this.zoom = function (fixedScreenPoint, scale) {
            var screenFraction = (fixedScreenPoint - screenRange[0]) / (screenRange[1] - screenRange[0]);
            var fixedDataPoint = dataRange[0] + screenFraction * (dataRange[1] - dataRange[0]);

            var newBelow = (fixedDataPoint - dataRange[0]) * scale;
            var newAbove = (dataRange[1] - fixedDataPoint) * scale;
            encloseData = false;
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

    return HRuler;
});