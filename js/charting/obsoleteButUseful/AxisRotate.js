/**
 * @module core/interaction
 */
function axisRotate(axis) {
    "use strict";

    /**
    @class AxisRotate
    */
	function rotate(event, dx, dy) {
		axis.azimuth += dx / 80;
		axis.elevation += dy / 80;
		axis.redraw();
	}

	axis.eventHandler = {
	    mouseDragHandler : rotate
    };
}
