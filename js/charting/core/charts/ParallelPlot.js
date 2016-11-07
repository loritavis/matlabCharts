/**
 * @module core/charts
 */
define([
    "../rulers/VRuler",
    "../utilities/color/Color",
    "../utilities/Arrays",
    "./base/Chart"
], function (VRuler, Color, Arrays, Chart) {
    "use strict";

    /**
     * @class ParallelPlot
     * @param dataset
     * @constructor
     */
    function ParallelPlot(dataset) {
        Chart.apply(this);
        var that = this;

        // private data

        // This will be filled in by createParts();
        var columns = [];

        // ruler placement
        var top;
        var fontSize = 18;

        // PUBLIC PROPERTIES
        // draw will use all of these
        this.textColor = 'black';
        // this.backgroundColor = '#FFF';
        this.font = '18px serif';

        var labelFont = '20px serif';
        var rulerLineColor = 'rgba(0,0,0,0.5)';
        var colorOrder = Color.currentColorTheme.ColorOrder;
        var colorIndex = 0;

        function makeDoubleColumn(name, data) {
            var ruler;

            ruler = new VRuler();
            ruler.lineColor = rulerLineColor;
            var range = Arrays.range(data);
            ruler.dataRange = [range.min,range.max];
            ruler.encloseData = true;
            var color = colorOrder[colorIndex % colorOrder.length];
            colorIndex += 1;
            columns.push({ruler: ruler, name: name, data: data, selection: null, color: color});
        }

        /*
         function makeCategoricalColumn(col) {
         var ruler = new VRuler();
         ruler.lineColor = rulerLineColor;
         ruler.dataRange = col.getLevels();
         ruler.encloseData = true;
         // we have to make the ticks, limits, and labels ourselves since rulers are not
         // interested in categoricals.
         //ticks are 1:N
         ruler.tickValues = col.getLevels();
         ruler.tickLabels = col.getLabels();
         // limits are just a little past the data
         ruler.dataRange = [0.5, col.getLabels().length + 0.5];
         // prevent the ruler from overwriting when resized.
         //   ruler.frozenTicks = true;

         var color = colorOrder[colorIndex % colorOrder.length];
         colorIndex += 1;
         columns.push({ruler: ruler, name: col.getColName(), data: col.getData(), selection: null, color: color});
         }

         function makeLogicalColumn(col) {
         var ruler = new VRuler();
         ruler.lineColor = rulerLineColor;
         ruler.dataRange = [0, 1];
         ruler.encloseData = true;

         ruler.tickValues = [1, 2];
         ruler.tickLabels = ['false', 'true'];
         ruler.dataRange = [0.5, 2.5];
         //ruler.frozenTicks = true;

         var numericData = [];
         var j;
         for (j = 0; j < col.getNumEl(); j += 1) {
         if (col.getElemAt(j)) {
         numericData[j] = 2;
         } else {
         numericData[j] = 1;
         }
         }
         var color = colorOrder[colorIndex % colorOrder.length];
         colorIndex += 1;
         columns.push({ruler: ruler, name: col.getColName(), data: numericData, selection: null, color: color});
         }
         */

        function createParts() {
            columns = [];
            var n = dataset.getNumVariables();
            for (var i = 0; i < n; i++) {
                makeDoubleColumn(dataset.getVariableNameByIndex(i), dataset.getVariableByIndex(i));
            }
        }

        var lineColors;

        function calculateSelection() {
            // make an array (lineColors) with the color for each line
            var data = columns[0].data;
            var N = data.length;

            // the color of each line is the average of the colors of the selection bars intersecting it
            var r = new Array(N);
            var g = new Array(N);
            var b = new Array(N);
            var n = new Array(N);

            var i, j;

            for (i = 0; i < N; i += 1) {
                r[i] = 0;
                g[i] = 0;
                b[i] = 0;
                n[i] = 0;
            }

            // build this once in create parts
            // get the colors of each column in RGB form
            var rSection = new Array(columns.length);
            var gSection = new Array(columns.length);
            var bSection = new Array(columns.length);
            for (i = 0; i < columns.length; i += 1) {
                var rgb = Color.parseColor(columns[i].color);
                rSection[i] = rgb[0];
                gSection[i] = rgb[1];
                bSection[i] = rgb[2];
            }

            // add the color of each column to the rgb of the linesit intersects
            for (i = 0; i < columns.length; i += 1) {
                var selection = columns[i].selection;
                if (selection) {
                    var lowerBound = Math.min(selection[0], selection[1]);
                    var upperBound = Math.max(selection[0], selection[1]);
                    data = columns[i].data;
                    for (j = 0; j < data.length; j += 1) {
                        if (data[j] >= lowerBound && data[j] <= upperBound) {
                            r[j] += rSection[i];
                            g[j] += gSection[i];
                            b[j] += bSection[i];
                            n[j] += 1;
                        }
                    }
                }
            }

            // build the actual color strings
            lineColors = new Array(data.length);
            for (j = 0; j < data.length; j += 1) {
                var d = 256 * n[j]; // the 265 maps from javascript color range (0-255) to rgbToJavaScript (0-1);
                if (d !== 0) {
                    lineColors[j] = Color.rgbToJavaScript([r[j] / d, g[j] / d, b[j] / d]);
                } else {
                    lineColors[j] = '#ACC';
                }
            }
        }

        /*
         function setSelection(c, lower, upper) {
         columns[c].selection = [lower, upper];
         calculateSelection();
         }
         */

        this.clearSelection = function () {
            var i;
            for (i = 0; i < columns.length; i += 1) {
                columns[i].selection = null;
            }
            this.redraw();
        };

        this.layoutRulers = function (context) {
            var i;
            // choose a font size for the column labels

            // no bigger than this
            fontSize = 18;
            context.font = fontSize + 'px serif';
            var xGap = Math.round(this.width / columns.length);

            // if any column name is too long, shrink the font size
            for (i = 0; i < columns.length; i += 1) {
                // no lower than 8   95% of the gap is almost touching
                while (fontSize > 8 && context.measureText(columns[i].name).width > (0.95 * xGap)) {
                    fontSize -= 1;
                    context.font = fontSize + 'px serif';
                }
            }
            labelFont = fontSize + 'px serif';

            // space the rulers out evenly horizontally
            // set them all to the same top and bottom
            var range = [this.y + this.height - 15, this.y + fontSize + 12];
            var xCenter = this.x + Math.round(xGap / 2);
            for (i = 0; i < columns.length; i += 1) {
                var ruler = columns[i].ruler;
                ruler.screenRange = range;
                ruler.baseline = 0.5 + Math.floor(xCenter);
                xCenter += xGap;
            }

        };

        this.draw = function (context) {
            var i, j, ruler;
            var firstRuler, yOffset, nextRuler;

            this.layoutRulers(context);
            calculateSelection();

            // draw column labels
            context.fillStyle = this.textColor;
            context.font = labelFont;
            context.textAlign = "center";
            context.textBaseline = "top";
            for (i = 0; i < columns.length; i += 1) {
                context.fillText(columns[i].name, columns[i].ruler.baseline, this.y + 2);
            }

            // draw the data lines

            context.lineWidth = 1;
            for (i = 0; i < columns[0].data.length; i += 1) {
                context.beginPath();
                context.strokeStyle = lineColors[i];
                firstRuler = columns[0].ruler;
                yOffset = firstRuler.map(columns[0].data[i]);
                context.moveTo(firstRuler.baseline, yOffset);
                for (j = 1; j < columns.length; j += 1) {
                    nextRuler = columns[j].ruler;
                    yOffset = nextRuler.map(columns[j].data[i]);
                    context.lineTo(nextRuler.baseline, yOffset);
                }
                context.stroke();
            }


            // draw the rulers
            for (i = 0; i < columns.length; i += 1) {
                ruler = columns[i].ruler;
                ruler.draw(context);

                // draw selection
                var selection = columns[i].selection;
                if (selection) {
                    var lowerBound = ruler.map(selection[0]);
                    var upperBound = ruler.map(selection[1]);
                    context.fillStyle = columns[i].color;
                    context.fillRect(ruler.baseline - 5, lowerBound, 10, upperBound - lowerBound);

                    context.fillStyle = 'rgba(255,255,255,0.9)';
                    context.fillRect(ruler.baseline + 6, lowerBound - 10, 50, 20);
                    context.fillRect(ruler.baseline + 6, upperBound - 10, 50, 20);

                    context.textAlign = "left";
                    context.textBaseline = "middle";
                    context.fillStyle = '#00F';
                    context.fillText(selection[0].toFixed(2), ruler.baseline + 9, lowerBound);
                    context.fillText(selection[1].toFixed(2), ruler.baseline + 9, upperBound);
                }
            }
        };

        // Interaction handlers
        var whichRuler = -1;
        var dragAction = '';

        function findHitRuler(event) {
            var r = -1;
            var j;
            for (j = 0; j < columns.length; j += 1) {
                var baseline = columns[j].ruler.baseline;
                if (Math.abs(baseline - event.x) < 40) {
                    r = j;
                    break;
                }
            }
            return r;
        }

        function mouseDown(event) {
            // which ruler did the mouse go down on?
            whichRuler = findHitRuler(event);

            if (whichRuler === -1) {
                return;
            }

            // what kind of action we are starting depends on where the mouse went down
            if (event.y < top) {
                dragAction = 'slide';
            } else {
                var column = columns[whichRuler];
                var y = column.ruler.reverseMap(event.y);
                var selection = column.selection;
                // did you hit an existing selection?
                if (selection !== null && y > Math.min(selection[0],
                    selection[1]) && y < Math.max(selection[0], selection[1])) {
                    // top third is move top, middle is drag, bottom is move bottom
                    var fraction = Math.abs((y - selection[0]) / (selection[1] - selection[0]));
                    if (fraction < 1 / 4) {
                        dragAction = 'slideZero';
                    } else if (fraction < 3 / 4) {
                        dragAction = 'moveSelection';
                    } else {
                        dragAction = 'slideOne';
                    }
                } else {
                    // There is no selection on this ruler, make a new one
                    if (!event.shiftKey) {
                        that.clearSelection();
                    }
                    column.selection = [y, y];
                    dragAction = 'slideOne';
                }
            }

        }

        function slideRuler(dx) {
            var temp, b;

            columns[whichRuler].ruler.baseline += dx;

            // swap columns when necessary
            if (whichRuler > 0) {
                if (columns[whichRuler].ruler.baseline < columns[whichRuler - 1].ruler.baseline) {
                    temp = columns[whichRuler];
                    columns[whichRuler] = columns[whichRuler - 1];
                    columns[whichRuler - 1] = temp;
                    whichRuler = whichRuler - 1;

                    b = columns[whichRuler].ruler.baseline;
                    columns[whichRuler].ruler.baseline = b;
                }
            }
            if (whichRuler < (columns.length - 1)) {
                if (columns[whichRuler].ruler.baseline > columns[whichRuler + 1].ruler.baseline) {
                    temp = columns[whichRuler];
                    columns[whichRuler] = columns[whichRuler + 1];
                    columns[whichRuler + 1] = temp;
                    whichRuler = whichRuler + 1;

                    b = columns[whichRuler].ruler.baseline;
                    columns[whichRuler].ruler.baseline = b;
                }
            }
        }

        function mouseDrag(event, dx, dy) {
            if (whichRuler === -1) {
                return;
            }

            if (dragAction === 'slide') {
                slideRuler(dx);
            } else {
                var column = columns[whichRuler];
                var selection = column.selection;
                var dataDY = column.ruler.reverseMap(event.y + dy) - column.ruler.reverseMap(event.y);
                if (dragAction === 'slideZero') {
                    selection[0] += dataDY;
                } else if (dragAction === 'moveSelection') {
                    selection[0] += dataDY;
                    selection[1] += dataDY;
                } else if (dragAction === 'slideOne') {
                    selection[1] += dataDY;
                }
            }
            this.redraw();
        }

        function doubleClick(event) {
            if (event.mouseDownY < top) {
                whichRuler = findHitRuler(event);
                if (whichRuler === -1) {
                    return;
                }
                var ruler = columns[whichRuler].ruler;
                if (ruler.getDirection() === 'reverse') {
                    ruler.setDirection('normal');
                } else {
                    ruler.setDirection('reverse');
                }
            }
        }

        this.mouseDownHandler = mouseDown;
        this.mouseDragHandler = mouseDrag;
        this.mouseShiftDragHandler = mouseDrag;
        this.doubleClickHandler = doubleClick;
        this.eventHandler = this;

        createParts();
        // todo Make sure we select a valid column
        // setSelection(2,125,150);
        // Object.seal(this);
    }

    ParallelPlot.prototype = Object.create(Chart.prototype);
    return ParallelPlot;
});
