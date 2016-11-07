/**
 * @module core/interaction/events
 */
define(["../../utilities/Really"], function (Really) {
    "use strict";
    /**
     * You've probably noticed that the events that come from the canvas are
     * always converted into one of these.
     * This object exists to provide mouse events that are stable across browsers.
     *
     * @class XYEvent
     * @constructor
     */
    function XYEvent(xy, shift, button) {
        if (xy) {
            Really.array(xy, 'expect event x and y in an array, not', JSON.stringify(xy));
            this.x = xy[0];
            this.y = xy[1];
        } else {
            this.x = 0;
            this.y = 0;
        }
        this.shiftKey = shift;
        this.button = button;
    }

    return XYEvent;
});