/**
 * @module core/charts
 */
define([
    "../knobs/Bezel",
    "../../rulers/RadialRuler",
    "../knobs/Needle",
    "../base/Chart"
], function (Bezel, RadialRuler, Needle, Chart) {
    "use strict";

    function Gauge(initialValue) {
        Chart.apply(this);

        var value = 70;

        if (initialValue) {
            value = initialValue;
        }

        var color = '#e0e0e0';

        // private properties
        var ruler, bezel, indicator;

        Object.defineProperty(this, "value", {
            get: function () {
                return value;
            },
            set: function (newValue) {
                value = Math.max(0, Math.min(100, newValue));
                this.redraw();
            }
        });

        Object.defineProperty(this, "color", {
            get: function () {
                return color;
            },
            set: function (newColor) {
                color = newColor;
                bezel.setColor(newColor);
                indicator.diskColor = newColor;
                this.redraw();
            }
        });

        Object.defineProperty(this, "ticks", {
            get: function () {
                return ruler.ticks;
            },
            set: function (newValue) {
                ruler.ticks = newValue;
                this.redraw();
            }
        });


        // make the radial ruler
        ruler = new RadialRuler(200, 200, 120);
        ruler.ticks = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
        ruler.minorTicks = [5, 15, 25, 35, 45, 55, 65, 75, 85, 95];
        // ruler.tickLabels = ['0', '10', '20', '30', '40', '50', '60', '70', '80', '90', '100'];

        var rulerColor = '#333';

        ruler.lineColor = rulerColor;
        ruler.tickColor = rulerColor;
        ruler.tickIn = 8;
        ruler.tickOut = 0;

        ruler.minorTickColor = rulerColor;
        ruler.minorTickIn = 5;
        ruler.minorTickOut = 0;

        ruler.tickLabelColor = rulerColor;

        // make the bezel
        bezel = new Bezel(200, 200, 120);

        // make the indicator
        indicator = new Needle(200, 200, 120);
        indicator.needleColor = 'red';
        indicator.diskColor = color;

        this.sizeComponents = function () {
            var radius = Math.min(this.width, this.height) / 2;
            var centerX = this.x + this.width / 2;
            var centerY = this.y + this.height / 2;

            bezel.setSize(centerX, centerY, radius);
            ruler.setSize(centerX, centerY, 0.82 * radius);
            indicator.setSize(centerX, centerY, 0.78 * radius);
        };

        // backgroundImage
        var backgroundImage = null;
        var backgroundNeedsRemade = true;

        this.draw = function (context) {
            var margin = 10;

            // TODO: What about Gauge background caching optimization for speed
            if (backgroundNeedsRemade) {
                this.sizeComponents();
                // how big should the buffer canvas be?
                var imWidth = 2 * margin + this.width;
                var imHeight = 2 * margin + this.height;

                backgroundImage = document.createElement('canvas');
                backgroundImage.width = imWidth;
                backgroundImage.height = imHeight;

                var bufferContext = backgroundImage.getContext('2d');
                bufferContext.translate(-this.x + margin, -this.y + margin);
                bezel.draw(bufferContext);
                ruler.draw(bufferContext);

                //backgroundNeedsRemade = false;
            }

            context.drawImage(backgroundImage, this.x - margin, this.y - margin);
            indicator.draw(context, ruler.valueToAngle(this.value));
        };

        // Object.seal(this);
    }

    //TODO: What is this for? is it necessary?
    Gauge.prototype = Object.create(Chart.prototype);
    return Gauge;
});
