define([], function() {
    "use strict";

    function AxisDataCursor (axis, line) {
        "use strict";
        var cursor = null;
        var fadeStep = 0;

        // Position the label on the line.
        // If interp is true, than hit nearest point on the line.
        // Otherwise, hit the nearest data point.
        function setLabelPosition (event, interpolateBetweenDataPoints) {
            var xMouse = axis.screenToDataX(event.x);
            var yMouse = axis.screenToDataY(event.y);
            var xPoints;
            var yPoints;
            var i;

            if (line) {
                if (interpolateBetweenDataPoints) {
                    xPoints = line.xData;
                    yPoints = line.yData;
                    // First, find the x points spanning the mouse x
                    for (i = 0; i < xPoints.length; i += 1) {
                        if (xMouse < xPoints[i]) {
                            // and interpolate the associated y value.
                            var xFraction = (xMouse - xPoints[i - 1]) / (xPoints[i] - xPoints[i - 1]);
                            var yInterp = yPoints[i - 1] + xFraction * (yPoints[i] - yPoints[i - 1]);
                            cursor.x = xMouse;
                            cursor.y = yInterp;
                            break;
                        }
                    }
                } else {
                    // find the closest data point
                    var minD = 1e200;
                    xPoints = line.xData;
                    yPoints = line.yData;
                    var xHit = 0;
                    var yHit = 0;
                    for (i = 0; i < xPoints.length; i += 1) {
                        var dx = xMouse - xPoints[i];
                        var dy = yMouse - yPoints[i];

                        // closest in screen distance, not data distance.
                        dx *= axis.scaleX;
                        dy += axis.scaleY;

                        var d = dx * dx + dy * dy;
                        if (d < minD) {
                            minD = d;
                            xHit = xPoints[i];
                            yHit = yPoints[i];
                        }
                    }
                    cursor.x = xHit;
                    cursor.y = yHit;
                }
            } else {
                // If no line was passed to the constructor, use mouse point
                cursor.x = xMouse;
                cursor.y = yMouse;
            }

            // The strings the cursor displays
            cursor.yLeftString = cursor.y.toFixed(2);
            cursor.xTopString = cursor.x.toFixed(2);
        }

        // drive the alpha of the cursor from zero to one
        function fadeIn () {
            if (fadeStep >= 0) {
                fadeStep -= 1;
                var v = 1 - fadeStep / 20;
                cursor.color = 'rgba(0,0,0,' + v + ')';
                axis.redraw();
                setTimeout(fadeIn, 30);
            }
        }

        // drive the alpha of the cursor to zero then remove it
        function fadeOut () {
            if (fadeStep <= 0) {
                axis.remove(cursor);
            } else {
                fadeStep -= 1;
                var v = fadeStep / 20;
                cursor.color = 'rgba(0,0,0,' + v + ')';
                axis.redraw();
                setTimeout(fadeOut, 30);
            }
        }

        // In response to a mouse down, we create and add a label
        function addLabel (event) {
            //cursor = new Cursor(ax, 0, 0);
            setLabelPosition(event);
            //axis.add(cursor);
            fadeStep = 20;
            fadeIn();
        }

        // Shift mouse drag
        function moveLabel (event) {
            setLabelPosition(event, false);
            axis.redraw();
        }


        // mouse drag
        function moveLabelInterp (event) {
            setLabelPosition(event, true);
            axis.redraw();
        }


        // mouse up
        function removeLabel () {
            fadeStep = 20;
            fadeOut();
        }


        axis.eventHandler = {
            mouseDownHandler: addLabel,
            mouseDragHandler: moveLabelInterp,
            mouseShiftDragHandler: moveLabel,
            mouseUpHandler: removeLabel
        };

    }

    return AxisDataCursor;
});
