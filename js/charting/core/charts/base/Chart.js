/**
 * Different types of Charts
 *
 * @module core/charts/base
 */
define([
    "../../utilities/color/Color",
    "../../utilities/Really",
    "../../interaction/events/CanvasEventConnector"
], function (Color, Really, CanvasEventConnector) {
    "use strict";
    /**
     * Base class for every chart that can draw itself into a canvas 2D context.
     * @class Chart
     * @constructor
     */
    function Chart() {
        var that = this;

        var x = 0;
        var y = 0;
        var width = 300;
        var height = 200;

        var backgroundColor = Color.currentColorTheme.BackgroundColor;

        var parent = null;
        var domNode = null;

        this.minimumWidth = 40;
        this.minimumHeight = 40;
        this.annotations = [];
        this.title = this.constructor.name;

        /**
         * A single chart needs to clear its background before drawing anything else. Composite
         * charts might use transparency to allow background to be visible, but this might
         * lead to traces of the previous chart to remain visible.
         */
        Object.defineProperty(this, "backgroundColor", {
            get: function () {
                return backgroundColor;
            },
            set: function (newValue) {
                backgroundColor = newValue;
                this.redraw();
            },
            enumerable: true
        });

        Object.defineProperty(this, "x", {
            get: function () {
                return x;
            },
            set: function (newValue) {
                x = newValue;
                this.redraw();
            },
            enumerable: true
        });

        Object.defineProperty(this, "y", {
            get: function () {
                return y;
            },
            set: function (newValue) {
                y = newValue;
                this.redraw();
            },
            enumerable: true
        });

        Object.defineProperty(this, "width", {
            get: function () {
                return width;
            },
            set: function (newValue) {
                width = Math.max(that.minimumWidth, newValue);
                this.onSizeChanged();
                this.redraw();
            },
            enumerable: true
        });

        Object.defineProperty(this, "height", {
            get: function () {
                return height;
            },
            set: function (newValue) {
                height = Math.max(that.minimumHeight, newValue);
                this.onSizeChanged();
                this.redraw();
            },
            enumerable: true
        });

        Object.defineProperty(this, "parent", {
            get: function () {
                return parent;
            },
            set: function (p) {
                parent = p;
            }
        });

        Object.defineProperty(this, "domNode", {
            get: function () {
                if (domNode == null) {
                    domNode = document.createElement('CANVAS');
                    domNode.width = this.width;
                    domNode.height = this.height;
                    new CanvasEventConnector(domNode, this);
                }
                return domNode;
            },
            set: function (node) {
                domNode = node;
            }

        });

    }

    Chart.prototype.setLocation = function (xIn, yIn) {
        this.x = xIn;
        this.y = yIn;
        this.redraw();
    };

    // resize the canvas and redraw
    Chart.prototype.onSizeChanged = function () {
        this.domNode.width = this.width;
        this.domNode.height = this.height;
        this.redraw();
    };

    /**
     * Changes the size of the chart. Redraws.
     * @method setSize
     * @param w Width of the chart. If an array is passed, first element is width, second height
     * @param {number} h
     */
    Chart.prototype.setSize = function (w, h) {
        // If there is only one array passed
        if (w instanceof Array) {
            this.width = Math.max(this.minimumWidth, w[0]);
            this.height = Math.max(this.minimumHeight, w[1]);
        } else {
            this.width = Math.max(this.minimumWidth, w);
            this.height = Math.max(this.minimumHeight, h);
        }
        this.onSizeChanged();
    };

    // A chart will either draw in its own canvas (stored in its domNode)
    // or, if it has a parent, will send redraw requests on to it.
    Chart.prototype.setParent = function (p) {
        this.parent = p;
    };

    Chart.prototype.redraw = function () {
        if(this.parent){
            this.parent.redraw();
        }else if (this.domNode) {
            this.drawChart(this.domNode.getContext('2d'));
        }
    };

    // are these coordinated withing the x,y,width,height rectangle of this chart?
    Chart.prototype.hit = function (coords) {
        Really.object(coords, 'expected an object');
        return coords.x > this.x && coords.y > this.y && coords.x < (this.x + this.width) && coords.y < (this.y + this.height);
    };

    Chart.prototype.addAnnotation = function (note) {
        Really.assert(note, 'undefined annotation');
        this.annotations.push(note);
        this.redraw();
    };

    Chart.prototype.drawAnnotations = function (context, layer) {
        var i;
        for (i = 0; i < this.annotations.length; i += 1) {
            var annotation = this.annotations[i];
            if (annotation.layer === layer) {
                annotation.draw(context);
            }
        }
    };

    /**
     * Plots the chart into the given 2D context. In general:
     *
     *      clears background
     *      draws back level annotations
     *      plots this chart
     *      draws front level annotations
     *
     * @method drawChart
     * @param context 2D canvas to draw to
     */
    Chart.prototype.drawChart = function (context) {
        Really.assert(context, 'null drawing chart context');
        Really.assert(typeof context === 'object', 'drawing context should be an object');

        // catch bad graphics context2d manipulation when it happens
        Object.seal(context);

        if (this.backgroundColor) {
            context.fillStyle = this.backgroundColor;
            context.fillRect(this.x, this.y, this.width, this.height);
        }

        this.drawAnnotations(context, 'back');
        this.draw(context);
        this.drawAnnotations(context, 'front');
    };

    return Chart;
});