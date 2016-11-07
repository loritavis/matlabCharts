/**
 * module core/charts
 */
define([
    "./base/Chart",
    "./../rulers/HRuler",
    "./../rulers/RadialRuler",
    "./base/Sequence",
    "../glyphs/Line",
    "../utilities/color/Color",
    "../utilities/Arrays",
    "../utilities/Really"
], function (Chart, HRuler, RadialRuler, Sequence, Line, Color, Arrays, Really) {
    "use strict";

    /**
     * @class Polar
     * @extends Chart
     * @param radius
     * @param angle
     * @constructor
     */
    function Polar(radius, angle) {
        Really.defined(radius, "expected radius argument", JSON.stringify(radius));
        Really.defined(angle, "expected angle argument", JSON.stringify(angle));

        Really.array(radius, 'Polar inputs should be arrays');
        Really.array(angle, 'Polar inputs should be arrays');
        Chart.apply(this);
        var i;

        var gridColor = '#dde';

        var hRuler = new HRuler();
        hRuler.lineColor = "cce";
        hRuler.tickColor = null;
        hRuler.textColor = "77c";

        var rRuler = new RadialRuler(200, 200, 120);
        rRuler.lineColor = "cce";
        rRuler.tickColor = null;
        rRuler.tickLabelColor = "77c";
        rRuler.setAngle(2 * Math.PI, 0);
        rRuler.setRange(0, 360);
        rRuler.ticks = [0, 45, 90, 135, 180, 225, 270, 315];
        rRuler.tickLabels = ['0', '45', '90', '135', '180', '225', '270', '315'];
        rRuler.tickLabelFont = '16px serif';

        var lines = [];
        var centerX, centerY;

        var CO = Color.currentColorTheme.ColorOrder;
        for (i = 1; i < radius.length; i += 1) {
            var sequence = new Sequence(radius, angle);
            var line = new Line({color: CO[i % CO.length],width:1});
            sequence.addGlyph(line);

            lines.push(sequence);
        }

        function drawGrid(context, hRuler, rRuler) {
            // rays
            var tix = rRuler.ticks;
            var i;
            context.beginPath();
            for (i = 0; i < tix.length; i += 1) {
                context.moveTo(centerX, centerY);
                var angle = tix[i] * 2 * Math.PI / 360;
                var x = centerX + rRuler.radius * Math.cos(angle);
                var y = centerY - rRuler.radius * Math.sin(angle);
                context.lineTo(x, y);
            }
            context.strokeStyle = gridColor;
            context.stroke();

            // arcs
            tix = hRuler.ticks;
            var rTickValues = tix.values;
            context.beginPath();
            for (i = 0; i < rTickValues.length; i += 1) {
                var r = hRuler.map(rTickValues.map(i)) - hRuler.left;
                context.moveTo(centerX + r, centerY);
                context.arc(centerX, centerY, r, 0, 2 * Math.PI);
            }
            context.strokeStyle = gridColor;
            context.stroke();

        }

        function drawLine(context, line) {
            var i;
            // If there is a jump in theta of more than this between two points, we interpolate to find intermediate points to plot.

            var maxThetaStep = Math.PI / 30;
            var r = line.xData;
            var theta = line.yData;
            var screenR = hRuler.map(r[0]) - hRuler.screenRange[0];
            var x = centerX + screenR * Math.cos(theta[0]);
            var y = centerY - screenR * Math.sin(theta[0]);
            context.beginPath();
            context.moveTo(x, y);
            // draw each segment
            for (i = 1; i < theta.length; i += 1) {
                var lastR = screenR;
                screenR = hRuler.map(r[i]) - hRuler.screenRange[0];

                // can we do it in one step?
                var dTheta = Math.abs(theta[i] - theta[i - 1]);
                if (dTheta > maxThetaStep) {   // multiple steps are needed.
                    var nSteps = Math.ceil(dTheta / maxThetaStep);
                    var j;
                    for (j = 0; j < nSteps; j += 1) {
                        var fraction = (j + 1) / nSteps;
                        var stepTheta = theta[i - 1] + fraction * dTheta;
                        var stepR = lastR + fraction * (screenR - lastR);
                        x = centerX + stepR * Math.cos(stepTheta);
                        y = centerY - stepR * Math.sin(stepTheta);
                        context.lineTo(x, y);
                    }
                } else {
                    x = centerX + screenR * Math.cos(theta[i]);
                    y = centerY - screenR * Math.sin(theta[i]);
                    context.lineTo(x, y);
                }
            }

            context.stroke();

            // data dots
            context.beginPath();
            for (i = 0; i < r.length; i += 1) {
                screenR = hRuler.map(r[i]) - hRuler.left;
                x = centerX + screenR * Math.cos(theta[i]);
                y = centerY - screenR * Math.sin(theta[i]);
                context.moveTo(x, y);
                context.arc(x, y, 1.5, 0, 2 * 3.1415, false);
            }
            context.fillStyle = line.color;
            context.fill();
        }

        this.draw = function (context) {

            // calculate the placement of the plot
            var radius = Math.min(this.width, this.height) / 2;
            centerX = this.x + this.width / 2;
            centerY = this.y + this.height / 2;

            // setup the radial ruler
            rRuler.setSize(centerX, centerY, 0.82 * radius);
            rRuler.labelRadius = rRuler.radius + 15;

            // setup the horizontal ruler
            hRuler.screenRange = [centerX, centerX + 0.82 * radius];
            hRuler.baseline = centerY;
            hRuler.dataRange = [0, 100];

            // draw everything
            drawGrid(context, hRuler, rRuler);
            hRuler.draw(context);
            rRuler.draw(context);
            for (i = 0; i < lines.length; i += 1) {
                drawLine(context, lines[i]);
            }
        };

        Object.seal(this);
    }

    Polar.prototype = Object.create(Chart.prototype);
    return Polar;
});
