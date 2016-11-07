/**
 * @module core/charts
 */
define([
    "../rulers/VRuler",
    "../rulers/HRuler",
    "./base/Dataspace",
    "./base/Sequence",
    "../glyphs/Markers",
    "../glyphs/PointLabels",
    "../glyphs/Line",
    "./base/Chart",
    "../utilities/color/Color",
    "../utilities/Really",
    "../utilities/SafeApply"
], function(VRuler, HRuler, DataSpace, Sequence, Marker, PointLabels, Line, Chart, Color, Really, SafeApply) {
    // TODO: should safeApply be a method of Chart?
    "use strict";

    /**
     * @class PlotYY
     * @constructor
     */
    function PlotYY(table, configuration) {

        // Boilerplate input checking
        // TODO: make a utility for constructors that take a table and an optional configuration
        Really.assert(table, 'missing table argument');

        Really.assert(arguments.length < 3, 'At most two arguments cam be passed to Plot.');

        Chart.apply(this);

        this.xVariableName = 'rowIndex';
        this.yVariableName = 'allVariables';

        if (configuration) {
            SafeApply(this, configuration);
        }

        var vRulers = [];
        var hRulers = [];
        var dataSpaces = [];

        function getX(table, xVariableName) {
            // X is either the data for a particular row or a ramp [0,1,2,3...]
            var x, i;
            if (xVariableName === 'rowIndex') {
                var N = table.getNumVariables();
                x = [];
                for (i = 0; i < N; i += 1) {
                    x[i] = i;
                }
            } else {
                x = table.getCol(xVariableName).getData();
                // data with units of "date" cause the ruler to behave differently
                //var units = table.getCol(xVariableName).getUnits();
                //if (units === "date") {
                //this.hRuler.treatDataAsTime = true;
                //}
            }
            return x;
        }

        function getYNames(table, yVariableName) {
            // make the yNames an array of the right names
            var yNames;
            if (yVariableName === 'allVariables') {
                yNames = table.getVarNames();
            } else {
                if (Array.isArray(yVariableName)) {
                    yNames = yVariableName;
                } else {
                    yNames = [ yVariableName ];
                }
            }
            return yNames;
        }

        // dataSpaces, lines and rulers
        this.createParts = function() {
            var colorOrder = Color.currentColorTheme.ColorOrder;

            var x = getX(table, this.xVariableName);
            var hRuler = new HRuler();
            hRuler.dataRange = [x[0], x[x.length-1]];
            hRulers.push({ x1: 0.05, x2: 0.95, y: 0.95, ruler: hRuler});

            var yNames = getYNames(table, this.yVariableName);
            var i, j;

            // How many data spaces will there be?
            for (i = 0; i < yNames.length; i += 1) {
                var oneColumn = table.getCol(yNames[i]);
                var type = oneColumn.getType();
                if (type === "double") {
                    var dataSpace = new DataSpace();
                    dataSpace.hRuler = hRuler;
                    dataSpace.vRuler = new VRuler();
                    dataSpaces.push(dataSpace);

                    var yDim = oneColumn.getSize(); // y-axis can be multidimensional

                    Really.equal(yDim[0], x.length, "In Plot, the number of rows of X (" + x.length +
                        ") must match the number of rows of Y (" + yDim[0] + "), Y dimensions", yDim);
                    // for each column of that variable.
                    for (j = 0; j < yDim[1]; j += 1) {
                        var sequence = new Sequence(x, oneColumn.getCol(j));
                        var line = new Line({color: colorOrder[(i + j) % colorOrder.length],width:1});
                        sequence.addGlyph(line);

                        var pointLabels = new PointLabels();
                        sequence.addGlyph(pointLabels);

                       // var marker = new Marker({shape:"square", size:2});
                       // sequence.addGlyph(marker);

                        dataSpace.contents.push(sequence);
                    }
                }
            }

            // place the vertical rulers
            var height = 1 / dataSpaces.length;
            var y = 0.02;
            for (i = 0; i < dataSpaces.length; i++) {
                dataSpace = dataSpaces[i];
                var range = dataSpace.getDataRange();
                dataSpace.vRuler.dataRange = [range.yMin, range.yMax];
                vRulers.push({y1: y + 0.8 * height, y2:y, x: 0.04, ruler: dataSpace.vRuler});
                y = y + height - 0.02;
            }
        };

        this.layoutRulers = function() {
            var i, ruler;

            for (i = 0; i < hRulers.length; i++) {
                ruler = hRulers[i];
                ruler.ruler.baseline = 0.5 + Math.round(this.y + this.height * ruler.y);
                ruler.ruler.screenRange = [this.x + this.width * ruler.x1, this.y + this.width * ruler.x2];
            }

            for (i = 0; i < vRulers.length; i++) {
                ruler = vRulers[i];
                ruler.ruler.baseline = this.y + this.width * ruler.x;
                ruler.ruler.screenRange = [this.x + this.height * ruler.y1, this.x + this.height * ruler.y2];
            }

        };

        this.draw = function(context) {
            this.layoutRulers();
            for (var i = 0; i < dataSpaces.length; i++) {
                dataSpaces[i].draw(context);
            }
            hRulers.forEach(function(ruler) {
                ruler.ruler.draw(context);
            });
            vRulers.forEach(function(ruler) {
                ruler.ruler.draw(context);
            });
         };

        // Interaction handlers
        var whichRuler = null;

        function dragHRuler(event, dx, dy) {
            whichRuler.x1 += dx / this.width;
            whichRuler.x2 += dx / this.width;
            whichRuler.y += dy / this.height;
            this.redraw();
        }

        function dragX1(event, dx, dy) {
            whichRuler.x1 = Math.min(whichRuler.x1 + dx / this.width);
            this.redraw();
        }

        function dragX2(event, dx, dy) {
            whichRuler.x2 = Math.max(whichRuler.x2 + dx / this.width);
            this.redraw();
        }

        function dragVRuler(event, dx, dy) {
            whichRuler.y1 += dy / this.height;
            whichRuler.y2 += dy / this.height;
            whichRuler.x += dx / this.width;
            this.redraw();
        }

        function dragY1(event, dx, dy) {
            whichRuler.y1 = Math.min(whichRuler.y1 + dy / this.height);
            this.redraw();
        }

        function dragY2(event, dx, dy) {
            whichRuler.y2 = Math.max(whichRuler.y2 + dy / this.height);
            this.redraw();
        }

        this.mouseDownHandler = function(event) {
            var ruler, index;
            var screenRange, baseline;

            whichRuler = null;
            this.mouseDragHandler = null;

            //for (index in vRulers) {
            for (index = 0; index < vRulers.length; index += 1) {
                ruler = vRulers[index];
                screenRange = ruler.ruler.screenRange;
                baseline = ruler.ruler.baseline;
                var lower = Math.min(screenRange[0],screenRange[1]);
                var upper = Math.max(screenRange[0],screenRange[1]);
                if (event.y >= lower && event.y <= upper && 20 >= Math.abs(event.x - baseline)) {
                    whichRuler = ruler;
                    if (Math.abs(event.y - screenRange[0]) < 20) {
                        this.mouseDragHandler = dragY1;
                    } else if (Math.abs(event.y - screenRange[1]) < 20) {
                        this.mouseDragHandler = dragY2;
                    } else {
                        this.mouseDragHandler = dragVRuler;
                    }
                    return;
                }
            }

            // for (index in hRulers) {
            for (index = 0; index < hRulers.length; index += 1) {
                ruler = hRulers[index];
                screenRange = ruler.ruler.screenRange;
                baseline = ruler.ruler.baseline;
                lower = Math.min(screenRange[0],screenRange[1]);
                upper = Math.max(screenRange[0],screenRange[1]);
                if (event.x >= lower && event.x <= upper && 20 >= Math.abs(event.y - baseline)) {
                    whichRuler = ruler;
                    if (Math.abs(event.x - screenRange[0]) < 20) {
                        this.mouseDragHandler = dragX1;
                    } else if (Math.abs(event.x - screenRange[1]) < 20) {
                        this.mouseDragHandler = dragX2;
                    } else {
                        this.mouseDragHandler = dragHRuler;
                    }
                    return;
                }
            }

            for (index = 0; index < dataSpaces.length; index += 1) {
                var dataSpace = dataSpaces[index];
                dataSpace.mouseDown(event);
            }

        };

        this.mouseDragHandler = null;
        this.eventHandler = this;

        this.createParts();

        //Object.seal(this);
    }

    PlotYY.prototype = Object.create(Chart.prototype);
    return PlotYY;
});
