/**
 * @module core/charts
 */
define([
    "./base/Chart",
    "../rulers/VRuler",
    "../utilities/color/Color",
    "../utilities/Really"
], function (Chart, VRuler, Color, Really) {
    "use strict";

    function ColorBar(inputs) {
        Chart.apply(this);

        Really.array(inputs, 'input to ColorBar should be an array');
        var data = inputs[0];
        var colorMap = Color.currentColorTheme.ColorMap;

        var ruler = new VRuler();

        this.draw = function (context) {
            var i, gradient = context.createLinearGradient(0, this.y, 0, this.y + this.height);
            for (i = 0; i < colorMap.length; i += 1) {
                gradient.addColorStop(i / colorMap.length, Color.rgbToJavaScript(colorMap[i]));
            }
            context.fillStyle = gradient;
            context.fillRect(this.x, this.y, this.width - 20, this.height);

            ruler.screenRange = [this.y, this.y + this.height];
            ruler.baseline = this.x + this.width - 20;
            ruler.dataRange = [data[0], data[data.length - 1]];
            ruler.labelPosition = 'right';

            ruler.draw(context);
        };

        this.backgroundColor = null;
        Object.seal(this);
    }

    ColorBar.prototype = Object.create(Chart.prototype);
    return ColorBar;
});