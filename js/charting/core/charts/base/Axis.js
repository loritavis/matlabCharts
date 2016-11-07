/**
 * @module core/charts/base
 */
define([
    "./Chart",
    "../../rulers/HRuler",
    "../../rulers/VRuler",
    "./Dataspace",
    "../../utilities/Layout",
    "../../interaction/AxisPanZoom"
], function (Chart, HRuler, VRuler, DataSpace, Layout, axisPanZoom) {
    "use strict";

    /**
     * @class Axis
     * @extends Chart
     * @constructor
     */
    function Axis() {
        Chart.apply(this);
        var that = this;

        // PUBLIC FIELDS
        //TODO: Need to make real properties with set methods so changing redraws
        this.xLabel = null;
        this.yLabel = null;
        this.title = null;

        // PRIVATE FIELDS
        var range; // range of the data in contents
        var fitXRangeToData = true;
        var fitYRangeToData = true;

        // array of children to draw
        this.dataSpace = new DataSpace();
        this.dataSpace.hRuler = new HRuler();
        this.dataSpace.vRuler = new VRuler();

        axisPanZoom(this); // set a mouse interaction

        /**
         * find the limits of the set of children
         *
         * @function findDataLimits
         * @private
         */
        this.findDataLimits = function () {
            range = this.dataSpace.getDataRange();

            // If there is NO extent in the data, force some because the axis MUST have some extent.
            if (range.xMin === range.xMax) {
                range.xMin -= 1;
                range.xMax += 1;
            }
            if (range.yMin === range.yMax) {
                range.yMin -= 1;
                range.yMax += 1;
            }

            this.redraw();
        };

        Object.defineProperty(this, "xRange", {
            get: function () {
                return that.dataSpace.hRuler.dataRange;
            },
            set: function (newValue) {
                that.dataSpace.hRuler.dataRange = newValue;
                fitXRangeToData = false;
                this.redraw();
            }
        });

        Object.defineProperty(this, "yRange", {
            get: function () {
                return that.dataSpace.vRuler.dataRange;
            },
            set: function (newValue) {
                that.dataSpace.vRuler.dataRange = newValue;
                fitYRangeToData = false;
                this.redraw();
            }
        });

        // PUBLIC METHODS
        this.setLimits = function (xMin, xMax) {
            if (xMin === null && xMax === null) {
                fitXRangeToData = true;
                this.findDataLimits();
            }
            this.redraw();
        };

        this.add = function (child) {
            this.dataSpace.addChild(child);
            child.parent = this;
            this.findDataLimits();
        };

        this.remove = function (toRemove) {
            this.dataSpace.removeChild(toRemove);
            this.findDataLimits();
        };

        // Clear Axis
        this.clear = function () {
            this.dataSpace.clear();
            this.findDataLimits();
        };

        // when a child's data is changed, it will notify its parent (this axis)
        /*
         this.childChanged = function () {
         this.findDataLimits();
         };
         */
        // layout components
        var titleHString, hMain, hRuler, hString, vString, vRuler, vMain;

        // the rulers, labels and data space all need to be positioned in the canvas area.
        this.layoutAxis = function (context) {

            if (fitXRangeToData) {
                this.dataSpace.hRuler.encloseData = true;
                this.dataSpace.hRuler.dataRange = [range.xMin, range.xMax];
            }
            this.dataSpace.hRuler.screenRange = [0, this.width];

            if (fitYRangeToData) {
                this.dataSpace.vRuler.encloseData = true;
                this.dataSpace.vRuler.dataRange = [range.yMin, range.yMax];
            }
            this.dataSpace.vRuler.screenRange = [0, this.height];

            // build vertical layout
            var vFormat = [];
            if (this.title) {
                titleHString = Layout.hString(this.title);
                vFormat.push(titleHString);
                vFormat.push(Layout.gap());
            }
            hMain = Layout.main();
            vFormat.push(hMain);
            hRuler = Layout.hRuler(this.dataSpace.hRuler);
            vFormat.push(hRuler);
            if (this.xLabel) {
                hString = Layout.hString(this.xLabel);
                vFormat.push(hString);
                vFormat.push(Layout.gap());
            }

            // build horizontal layout
            var hFormat = [];
            if (this.yLabel) {
                vString = Layout.vString(this.yLabel);
                hFormat.push(vString);
            }
            vRuler = Layout.vRuler(this.dataSpace.vRuler);
            hFormat.push(vRuler);
            vMain = Layout.main();
            hFormat.push(vMain);

            Layout.performLayout(context, hFormat, vFormat, this);

            this.dataSpace.hRuler.baseline = hRuler.topY;
            this.dataSpace.hRuler.screenRange = [vRuler.rightX, vMain.rightX];

            this.dataSpace.vRuler.baseline = vRuler.rightX;
            this.dataSpace.vRuler.screenRange = [hRuler.topY, hMain.topY];
        };

        this.draw = function (context) {
            var x, y;

            this.layoutAxis(context);
            this.dataSpace.draw(context);
            this.dataSpace.vRuler.draw(context);
            this.dataSpace.hRuler.draw(context);

            // draw the title
            context.fillStyle = "black";
            if (this.title) {
                context.textAlign = "center";
                context.textBaseline = "top";
                x = (vRuler.rightX + vMain.rightX) / 2;
                context.fillText(this.title, x, titleHString.topY);
            }

            if (this.yLabel) {
                context.textAlign = "center";
                context.textBaseline = "bottom";
                y = (hRuler.topY + hMain.topY) / 2;
                x = vString.rightX;

                context.translate(x, y);
                context.rotate(-Math.PI / 2);
                context.fillText(this.yLabel, 0, 0);
                context.rotate(Math.PI / 2);
                context.translate(-x, -y);
            }

            // draw the axis labels
            if (this.xLabel) {
                context.textAlign = "center";
                context.textBaseline = "top";
                x = (vRuler.rightX + vMain.rightX) / 2;
                context.fillText(this.xLabel, x, hString.topY);
            }

        };

        this.pan = function (dx, dy) {
            this.dataSpace.hRuler.pan(dx);
            fitXRangeToData = false;

            this.dataSpace.vRuler.pan(dy);
            fitYRangeToData = false;

            this.redraw();
        };

        this.zoom = function (centerX, centerY, dx, dy) {
            this.dataSpace.hRuler.zoom(centerX, dx);
            fitXRangeToData = false;

            this.dataSpace.vRuler.zoom(centerY, dy);
            fitYRangeToData = false;

            this.redraw();
        };

        /*
         this.fitToDataRange = function () {
         fitXRangeToData = true;
         fitYRangeToData = true;
         this.redraw();
         };
         */
    }

    Axis.prototype = Object.create(Chart.prototype);
    return Axis; // The constructor
});