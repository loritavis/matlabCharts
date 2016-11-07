/**
 * @module charts/base/Sequence
 */
define([ "../../utilities/Mapper"], function (Map) {
    "use strict";

    function Sequence(x, y) {
        this.xData = x;
        this.yData = y;

        var glyphs = [];

        this.addGlyph = function (glyph) {
            glyphs.push(glyph);
        };

        this.draw = function (context, xMapper, yMapper) {
            var xSource = Map.Compound(Map.Index(this.xData), xMapper);
            var ySource = Map.Compound(Map.Index(this.yData), yMapper);
            glyphs.forEach(
                function (glyph) {
                    glyph.draw(context, xSource, ySource);
                }
            );

        };

        //TODO: Move this to Arrays
        this.getDataRange = function () {
            var i;
            var xMin = Number.MAX_VALUE;
            var xMax = -10e300;  // THIS CRASHES CHROME: Number.MIN_VALUE;
            var yMin = Number.MAX_VALUE;
            var yMax = -10e300;

            for (i = 0; i < this.xData.length; i += 1) {
                if (this.xData[i] > xMax) {
                    xMax = this.xData[i];
                }
                if (this.xData[i] < xMin) {
                    xMin = this.xData[i];
                }
                if (this.yData[i] > yMax) {
                    yMax = this.yData[i];
                }
                if (this.yData[i] < yMin) {
                    yMin = this.yData[i];
                }
            }
            return {xMin: xMin, xMax: xMax, yMin: yMin, yMax: yMax};
        };
    }

    return Sequence;

});