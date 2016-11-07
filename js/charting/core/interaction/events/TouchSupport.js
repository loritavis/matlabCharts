/**
 * @module core/interaction/events
 */
define([
    "./XYConnector"
], function (XYConnector) {
    "use strict";

    function noop() {}

    /**
     * Keeps track of touch position and state when events fire
     *
     * @class TouchSupport
     * @extends XYConnector
     * @beta
     */
    function TouchSupport() {
        XYConnector.apply(this);

        this.ontouchstart = function (event) {
            this.mouseIsDown = true;
            if (event) {
                this.mouseX = event.x;
                this.mouseY = event.y;
            }
        };

        this.ontouchend = function () {
            this.mouseIsDown = false;
        };

        this.ontouchmove = noop;

        this.ongesturechange = noop;
    }

    return TouchSupport;
});