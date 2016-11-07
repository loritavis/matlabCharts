/**
 * @module core/interaction
 */
define([], function () {
    "use strict";
    /**
    @class AxisPanZoom
    */
    function axisPanZoom(axis) {

        function doPhysics(axis,dx,dy){


            function stepPhysics(){

            }


        }



        // to support touch zoom
        var xCenter;
        var yCenter;

        var mouseDownX;
        var mouseDownY;

        var lastDX;
        var lastDY;

        function mouseDown(event) {
            mouseDownX = event.x;
            mouseDownY = event.y;
        }

        function pan(event, dx, dy) {
            axis.pan(dx, dy);
            lastDX = dx;
            lastDY = dy;
        }

        function mouseUp(event) {
            doPhysics(axis,lastDX,lastDY);
        }

        function zoom(event, dx, dy) {
            var rate = 0.01;
            var xScale, yScale;

            if (dx >= 0) {
                xScale = 1 / (1 + rate * dx);
            } else {
                xScale = 1 - rate * dx;
            }

            if (dy >= 0) {
                yScale = 1 + rate * dy;
            } else {
                yScale = 1 / (1 - rate * dy);
            }

            axis.zoom(mouseDownX, mouseDownY, xScale, yScale);
        }

        // a touch zoom just started
        function zoomStart() {
            xCenter = this.xCenter;
            yCenter = this.yCenter ;
        }

        function scalezoom(scale) {
            axis.zoom(xCenter, yCenter, scale,scale);
        }

        function rescale() {
            if (typeof axis.setLimits === 'function') {
                axis.setLimits(null, null);
            }
        }

        // attach to the axis
        var eventHandler = {};

        eventHandler.mouseDownHandler = mouseDown;
        eventHandler.mouseDragHandler = pan;
        eventHandler.mouseUpHandler = mouseUp;
        eventHandler.mouseShiftDragHandler = zoom;
        eventHandler.doubleClickHandler = rescale;
        eventHandler.zoomStartHandler = zoomStart;
        eventHandler.zoomHandler = scalezoom;

        axis.eventHandler = eventHandler;
    }

    return axisPanZoom;
});
