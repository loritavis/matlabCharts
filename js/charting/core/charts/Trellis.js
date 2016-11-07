/**
 @module core/charts
 */
define([
    "./base/Chart",
    "./base/Dataspace",
    "./base/Sequence",
    "../glyphs/Markers",
    "../rulers/HRuler",
    "../rulers/VRuler",
    "../utilities/color/Color",
    "../utilities/Really",
    "../utilities/Arrays"
], function(Chart, DataSpace, Sequence, Marker, HRuler, VRuler, Color, Really, Arrays) {
    "use strict";

    /**
     @class Trellis
     */
    function Trellis(table) {
        Really.defined(table, 'missing data for Trellis chart');

        Chart.apply(this);

        // private data
        var variables, hRulers, vRulers, dataspaces;

        // PUBLIC PROPERTIES
        // draw will use all of these
        this.textColor = 'black';
        this.font = '18px serif';

        function createParts() {
            extractVariables();
            makeRulers();
            makeDataspaces();
        }

        // TODO: Table should provide something like this...
        function extractVariables() {
            variables = [];
            var numVariables = table.getNumVariables();

            for (var i = 0; i < numVariables; i += 1) {
                var variableData = table.getVariableByIndex(i);
                var variableName = table.getVariableNameByIndex(i);

                variables.push({
                    name: variableName,
                    data: variableData
                });
            }
        }

        function makeRulers() {
            var i;
            hRulers = [];
            vRulers = [];
            for (i = 0; i < variables.length; i += 1) {
                var ruler = new VRuler();
                ruler.lineColor = '#00f';
                ruler.encloseData = true;
                var range = Arrays.range(variables[i].data);
                ruler.dataRange = [range.min,range.max];
                ruler.labelPosition = "right";
                vRulers[i] = ruler;

                ruler = new HRuler();
                ruler.lineColor = '#00f';
                ruler.encloseData = true;
                range = Arrays.range(variables[i].data);
                ruler.dataRange = [range.min,range.max];
                hRulers[i] = ruler;
            }
        }

        function makeDataspaces() {
            var i, j;
            dataspaces = [];
            for (i = 0; i < variables.length; i += 1) {
                var vRuler = vRulers[i];
                var y = variables[i].data;

                // for each column
                for (j = 0; j < variables.length; j += 1) {
                    var hRuler = hRulers[j];
                    var x = variables[j].data;

                    var dataspace = new DataSpace(hRuler, vRuler);
                    var sequence = new Sequence(x, y);
                    var marker = new Marker({shape:"square", size:2});

                    sequence.addGlyph(marker);
                    dataspace.addChild(sequence);
                    dataspaces.push(dataspace);

                    // add variable name text to diagonal element
                    /*
                     if (i === j) {
                     var vRange = vRuler.screenRange;
                     var hRange = hRuler.screenRange;
                     var text = new Text(variables[i].name, hRange[0] + 5, vRange[1] + 2);
                     dataspace.addChild(text);
                     }
                     */
                }
            }
        }

        this.layoutRulers = function() {
            // TODO: How can we use Layout here?
            var n = variables.length;
            var i;
            var columnSpacing = (this.width - 30) / n;
            var rowSpacing = (this.height - 25) / n;

            for (i = 0; i < variables.length; i += 1) {
                var ruler = vRulers[i];
                var bottom = 0.5 + Math.floor(this.y + (i + 0.95) * rowSpacing);
                var top = 0.5 + Math.floor(this.y + (i + 0.06) * rowSpacing);
                ruler.screenRange = [bottom, top];
                ruler.baseline = 0.5 + Math.floor(this.x + this.width - 30);

                ruler = hRulers[i];
                var right = 0.5 + Math.floor(this.x + (i + 0.96) * columnSpacing);
                var left = 0.5 + Math.floor(this.x + (i + 0.04) * columnSpacing);
                ruler.screenRange = [left, right];
                ruler.baseline = 0.5 + Math.floor(this.y + this.height - 25);
            }
        };

        this.draw = function(context) {
            var i;

            this.layoutRulers();

            for (i = 0; i < dataspaces.length; i++) {
                dataspaces[i].draw(context);
            }

            for (i = 0; i < vRulers.length; i++) {
                vRulers[i].draw(context);
            }

            for (i = 0; i < hRulers.length; i++) {
                hRulers[i].draw(context);
            }

        };

        createParts();
        //Object.seal(this);
    }

    Trellis.prototype = Object.create(Chart.prototype);
    return Trellis;
});
