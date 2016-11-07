/**
 * @module charts/base/Dataspace
 */
define([], function() {
    "use strict";

    function DataSpace(hRuler, vRuler) {
        this.hRuler = hRuler;
        this.vRuler = vRuler;
        this.contents = [];

        this.backgroundColor = "rgba(200,200,255,0.2)";
        this.gridColor = "#ccc";

        this.addChild = function(child) {
            this.contents.push(child);
        };

        this.removeChild = function(child){
            var index = this.contents.indexOf(child);
            if(index !== -1){
                this.contents.splice(index, 1);
            }
        };

        this.clear = function(){
            this.contents = [];
        };

        this.draw = function(context) {
            // clip children to the ruler screen range
            var xScreenRange = this.hRuler.screenRange;
            var left   = Math.min(xScreenRange[0], xScreenRange[1]);
            var right  = Math.max(xScreenRange[0], xScreenRange[1]);

            var yScreenRange = this.vRuler.screenRange;
            var top    = Math.min(yScreenRange[0], yScreenRange[1]);
            var bottom = Math.max(yScreenRange[0], yScreenRange[1]);

            context.save();
            context.beginPath();
            context.moveTo(left, bottom);
            context.lineTo(left, top);
            context.lineTo(right, top);
            context.lineTo(right, bottom);
            context.lineTo(left, bottom);
            context.clip();

            this.drawBackground(context);
            this.drawHorizontalGrid(context);
            this.drawVerticalGrid(context);
            this.drawContents(context);

            context.restore();
        };

        this.drawContents = function(context) {
            var i;
            for (i = 0; i < this.contents.length; i++) {
                this.contents[i].draw(context, this.hRuler, this.vRuler);
            }
        };

        this.drawHorizontalGrid = function(context) {
            var k;
            var hRange = this.hRuler.screenRange;
            var vTicks = this.vRuler.ticks;
            var vValues = vTicks.values;
            context.beginPath();
            for (k = 0; k < vValues.length; k += 1) {
                var tickY = 0.5 + Math.floor(vTicks.dataToScreenMapper.map(vValues.map(k)));
                context.moveTo(hRange[0], tickY);
                context.lineTo(hRange[1], tickY);
            }
            context.strokeStyle = this.gridColor;
            context.stroke();
        };

        this.drawVerticalGrid = function(context) {
            var k;
            var vRange = this.vRuler.screenRange;
            var hTicks = this.hRuler.ticks;
            var hValues = hTicks.values;
            context.beginPath();
            for (k = 0; k < hValues.length; k += 1) {
                var tickX = 0.5 + Math.floor(hTicks.dataToScreenMapper.map(hValues.map(k)));
                context.moveTo(tickX, vRange[0]);
                context.lineTo(tickX, vRange[1]);
            }
            context.strokeStyle = this.gridColor;
            context.stroke();
        };

        this.drawBackground = function(context) {
            var hRange = this.hRuler.screenRange;
            var vRange = this.vRuler.screenRange;
            context.fillStyle = this.backgroundColor;
            context.fillRect(hRange[0], vRange[0], hRange[1] - hRange[0], vRange[1] - vRange[0]);
        };

        this.mouseDown = function(event) {
            this.contents.forEach(
                function(child) {
                    if (child.hit) {
                        child.hit(event.x, event.y);
                    }
                });
        };

        this.getDataRange = function() {
            var i;
            var xMin = Number.MAX_VALUE;
            var xMax = -10e300;  // THIS CRASHES CHROME: Number.MIN_VALUE;
            var yMin = Number.MAX_VALUE;
            var yMax = -10e300;

            for (i = 0; i < this.contents.length; i++) {
                var range = this.contents[i].getDataRange();
                if (range.xMax > xMax) {
                    xMax = range.xMax;
                }
                if (range.xMin < xMin) {
                    xMin = range.xMin;
                }
                if (range.yMax > yMax) {
                    yMax = range.yMax;
                }
                if (range.yMin < yMin) {
                    yMin = range.yMin;
                }
            }
            return {xMin: xMin, xMax: xMax, yMin: yMin, yMax: yMax};
        }
    }

    return DataSpace;
});