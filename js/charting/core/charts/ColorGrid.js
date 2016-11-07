/**
 * @module core/charts
 */
define([
    "./base/Chart",
    "../utilities/color/Color",
    "../utilities/Really",
    "../utilities/Layout",
    "../utilities/Mapper"
], function (Chart, Color, Really, Layout, Mapper) {
    "use strict";

    /**
     * @class ColorGrid
     * @param table
     * @constructor
     */
    function ColorGrid(table) {
        Chart.apply(this);

         // map data to attributes
        var rowLabelSource    = Mapper.Index(["One","Two","Three","Four","Five"]);
        var columnLabelSource = Mapper.Index(["a","b","c","d","e","f","g","h"]);

        var colorMapper = new Color.InterpolatingColorMapper();

        // TODO: Where should this live?
        function tableRange(table) {
            var i, j;
            var min = 1e308;
            var max = -1e308;

            for (i = 0; i < table.getNumVariables(); i += 1) {
                var data = table.getVariableByIndex(i);
                for (j = 0; j < data.length; j += 1) {
                    var d = data[j];
                    if (d < min && !isNaN(d)) {
                        min = d;
                    }
                    if (d > max && !isNaN(d)) {
                        max = d;
                    }
                }
            }
            return [min, max];
        }

        var range = tableRange(table);
        colorMapper.lower = range[0];
        colorMapper.upper = range[1];

        var rowLabels = Layout.stringStack(rowLabelSource);
        var midGap    = Layout.gap();
        var colLabels = Layout.stringRow(columnLabelSource);
        var hFormat = [rowLabels, midGap, colLabels];

        var vrowLabels = Layout.stringStack(rowLabelSource);
        var secondGap = Layout.gap();
        var vcolLabels = Layout.stringRow(columnLabelSource);
        var vFormat = [vrowLabels, secondGap, vcolLabels];

        this.draw = function (context) {
            var i, j;
            Layout.performLayout(context, hFormat, vFormat, this);
            for (i = 0; i < table.getNumVariables(); i += 1) {
                var data = table.getVariableByIndex(i);
                var x = midGap.rightX + i * (colLabels.width + colLabels.gap) - 0.5;
                for (j = 0; j < data.length; j += 1) {
                    var color = colorMapper.map(data[j]);
                    context.fillStyle = Color.rgbToJavaScript(color);
                    var y = vrowLabels.topY + j * (vrowLabels.height + vrowLabels.gap) - 0.5;
                    context.fillRect(x, y, colLabels.width, vrowLabels.height);
                }
            }

            Layout.drawStackedString(context, rowLabelSource, rowLabels, vrowLabels);
            Layout.drawStringRow(context, columnLabelSource, colLabels, vcolLabels);
        };
    }

    ColorGrid.prototype = Object.create(Chart.prototype);
    return ColorGrid;
});
