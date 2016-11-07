/**
 * @module core/interaction/events
 */
define([], function () {
    "use strict";

    /**
     * Passes events from canvas to target object
     *
     * @class XYConnector
     * @extends EventCoordinates
     */
    function XYConnector() {
        this.mouseIsDown = false;
        this.mouseX = 0;
        this.mouseY = 0;
    }

    return XYConnector;
});