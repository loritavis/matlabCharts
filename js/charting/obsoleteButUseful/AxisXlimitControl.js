/**
 * @module core/interaction
 */

/**
@class AxisXlimitControl
*/
function AxisXLimitControl(ax, x1, x2) {
    "use strict";
    var axis = ax;
    var thisController = this;
    var drag = 'left';
    var dx = 0;
    var dy = 0;

    //TODO: Where is XBand??
    //var band = new XBand(axis, x1, x2, '');
    var band = null;
    axis.add(band);

    function mouseDown(event) {
        var bandLeft = band.x1 * axis.scaleX + axis.offsetX;
        var bandRight = band.x2 * axis.scaleX + axis.offsetX;
        var x = event.x;

        if (x >= bandLeft && x <= bandRight) {
            if (x - 10 < bandLeft) {
                drag = 'left';
            } else if (x + 10 > bandRight) {
                drag = 'right';
            } else {
                drag = 'both';
            }
        } else {
            drag = 'nothing';
        }
    }

    function mouseMove(event, dxIn, dyIn) {
        dx = dxIn;
        dy = dyIn;

        var dxData = dx / axis.scaleX;
        if (drag === 'left' || drag === 'both') {
            band.x1 += dxData;
        }
        if (drag === 'right' || drag === 'both') {
            band.x2 += dxData;
        }

        axis.redraw();

        if (thisController.limitChangedListener) {
            thisController.limitChangedListener(band.x1, band.x2);
        }
    }

    // A little release animation
    function mouseUp(event) {
        dx *= 0.85;
        var speed = dx * dx;
        if (speed > 0.01) {
            mouseMove(event, dx, dy);
            setTimeout(mouseUp, 20);
        }
    }

    axis.eventHandler = {
        mouseDownHandler: mouseDown,
        mouseDragHandler: mouseMove,
        mouseUpHandler: mouseUp
    };
}