/**
 * @module core/interaction/events
 */
define([
    "./XYConnector"
], function (XYConnector) {
    "use strict";

    function noop() {}

    /**
     * Keeps track of mouse position and state when events fire
     *
     * @class MouseSupport
     * @extends XYConnector
     * @beta
     */
    function MouseSupport() {
        XYConnector.apply(this);

        this.onmouseup = function () {
            this.mouseIsDown = false;
        };

        this.onmousedown = function (event) {
            this.mouseIsDown = true;
            this.mouseX = event.x;
            this.mouseY = event.y;
        };

        this.ondblclick = noop;

        this.onmousemove = noop;
    }

    return MouseSupport;
});