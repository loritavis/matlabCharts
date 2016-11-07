/**
 * @module core/charts
 */
define([
    "./base/Chart"
], function (Chart) {
    "use strict";

    /**
     * Container for multiple charts.
     *
     * @class Container
     * @extends Chart
     * @param options
     * @constructor
     */
    function Container(options) {
        Chart.apply(this);
        var that = this;

        var charts = [];
        // interaction modes
        var passThru;
        var moveResize;

        /**
         * Adds given chart to this container
         * @public
         * @method add
         * @param chart
         */
        this.add = function (chart) {

            charts.push(chart);
            chart.setParent(this);
            chart.domNode = null;

            chart.setLocation(charts.length * this.offset, charts.length * this.offset);
            this.redraw();
        };

        /**
         * Draws all charts inside the container
         * @public
         * @method draw
         * @param context
         */
        this.draw = function (context) {
            context.fillStyle = this.backgroundColor;
            context.fillRect(this.x, this.y, this.width, this.height);

            var i;
            for (i = 0; i < charts.length; i += 1) {
                charts[i].drawChart(context);
            }
        };

        this.backgroundColor = "#BBF";
        this.offset = (options && options.offset) || 50;

        function toggleEventHandler() {
            if (that.eventHandler === moveResize) {
                that.eventHandler = passThru;
                that.backgroundColor = "#FFF";
            } else {
                that.eventHandler = moveResize;
                that.backgroundColor = "#BBF";
            }
            that.redraw();
        }

        function PassThruEventHandler() {

            var targetChart = null;

            // private functions
            function topChartAt(coords) {
                var i;
                for (i = charts.length - 1; i >= 0; i -= 1) {
                    var b = charts[i];
                    if (b.hit && b.hit(coords)) {
                        return b;
                    }
                }
                return null;
            }

            this.mouseDownHandler = function (event) {
                // Who did I go down on?
                targetChart = topChartAt(event);

                // If i went down on a chart...
                if (targetChart && targetChart.eventHandler &&
                    targetChart.eventHandler.mouseDownHandler) {
                    // pass the mouse down on to the chart
                    targetChart.eventHandler.mouseDownHandler(event);
                }
            };

            this.mouseDragHandler = function (event, dx, dy) {
                if (targetChart && targetChart.eventHandler &&
                    targetChart.eventHandler.mouseDragHandler) {
                    targetChart.eventHandler.mouseDragHandler(event, dx, dy);
                }
            };

            this.mouseShiftDragHandler = function (event, dx, dy) {
                if (targetChart && targetChart.eventHandler &&
                    targetChart.eventHandler.mouseShiftDragHandler) {
                    targetChart.eventHandler.mouseShiftDragHandler(event, dx,
                        dy);
                }
            };

            this.mouseUpHandler = function (event) {
                if (targetChart && targetChart.eventHandler &&
                    targetChart.eventHandler.mouseUpHandler) {
                    targetChart.eventHandler.mouseUpHandler(event);
                }
            };

            this.doubleClickHandler = toggleEventHandler;

        }


        // private functions
        function topChartAt(coords) {
            var i;
            for (i = charts.length - 1; i >= 0; i -= 1) {
                var b = charts[i];
                if (b.hit && b.hit(coords)) {
                    return b;
                }
            }
            return null;
        }

        function MoveResizeEventHandler() {

            var targetChart = null;

            // How does mouse motion map to size and location changes?
            var xFactor;
            var yFactor;
            var wFactor;
            var hFactor;

            this.mouseDownHandler = function (event) {
                // move block to end of array so it is on the top of the stacking order
                function chartToTop(chart) {
                    charts.splice(charts.indexOf(chart), 1);
                    charts.push(chart);
                }

                // Who did I go down on?
                targetChart = topChartAt(event);

                // If i went down on a chart...
                if (targetChart) {
                    chartToTop(targetChart);
                    that.redraw();

                    if (event.x < (targetChart.x + 20)) {
                        xFactor = 1;
                        wFactor = -1;
                    } else if (event.x < (targetChart.x + targetChart.width - 20)) {
                        xFactor = 1;
                        wFactor = 0;
                    } else {
                        xFactor = 0;
                        wFactor = 1;
                    }

                    if (event.y < (targetChart.y + 20)) {
                        yFactor = 1;
                        hFactor = -1;
                    } else if (event.y < (targetChart.y + targetChart.height - 20)) {
                        yFactor = 1;
                        hFactor = 0;
                    } else {
                        yFactor = 0;
                        hFactor = 1;
                    }
                }
            };

            this.mouseDragHandler = function (event, mx, my) {
                if (targetChart) {
                    if (wFactor !== 0 || hFactor !== 0) {
                        var dw = wFactor * mx;
                        var dh = hFactor * my;
                        targetChart.setSize(targetChart.width + dw, targetChart.height + dh);
                        that.redraw();
                    }

                    if (xFactor !== 0 || yFactor !== 0) {
                        var dx = xFactor * mx;
                        var dy = yFactor * my;
                        targetChart.setLocation(targetChart.x + dx, targetChart.y + dy);
                        that.redraw();
                    }
                }
            };


            this.doubleClickHandler = toggleEventHandler;


        }

        moveResize = new MoveResizeEventHandler();
        passThru = new PassThruEventHandler();

        this.eventHandler = moveResize;

        //Object.seal(this);
    }

    Container.prototype = Object.create(Chart.prototype);
    return Container;
});
