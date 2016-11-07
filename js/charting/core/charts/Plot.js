/**
 * @module core/charts
 */
define([
    "./base/Axis",
    "./base/Sequence",
    "../glyphs/Line",
    "../glyphs/PointLabels",
    "../glyphs/Markers",
    "../utilities/Properties",
    "../utilities/color/Color",
    "../utilities/Really",
    "../utilities/Mapper",
    "../utilities/SafeApply"
], function(Axis, Sequence, Line, PointLabels, Marker, Properties, Color, Really, Map, SafeApply) {
    "use strict";


    function PlotLine (configuration) {

        var sequence, line, pointLabels, marker;

        sequence = new Sequence([],[]);

        line = new Line();
        sequence.addGlyph(line);

        pointLabels = new PointLabels();
        sequence.addGlyph(pointLabels);

        marker = new Marker();
        sequence.addGlyph(marker);

        Object.defineProperty(this, "x", {
            get: function() {
                return sequence.xData;
            },
            set: function(input) {
                sequence.xData = input;
                pointLabels.xLabelSource = Map.Compound(Map.Index(input),Map.String(3));
            }
        });

        Object.defineProperty(this, "y", {
            get: function() {
                return sequence.yData;
            },
            set: function(input) {
                sequence.yData = input;
                pointLabels.yLabelSource = Map.Compound(Map.Index(input),Map.String(3));
            }
        });

        Properties.linkProperty(line,"color",this,"color");
        Properties.linkProperty(line,"width",this,"width");

        Properties.linkProperty(marker,"faceColor",this,"faceColor");
        Properties.linkProperty(marker,"edgeColor",this,"edgeColor");
        Properties.linkProperty(marker,"size",this,"markerSize");
        Properties.linkProperty(marker,"shape",this,"markerShape");

        if (configuration) {
            SafeApply(this, configuration);
        }

        this.draw = function(context,xmapper,yMapper){
            sequence.draw(context,xmapper,yMapper);
        };

        this.getDataRange = function(){
            return sequence.getDataRange();
        };
    }

    /**
     *
     * @param x
     * @param y
     * @param configuration
     * @constructor
     */
    function Plot(x, y, configuration) {
        Axis.apply(this);
        var that = this;

        /**
         2D lines
         @property lines
         @private
         */
        this.lines = [];

        Really.array(x, "x must be an array");
        Really.array(y, "y must be an array");

        if (!(y[0] instanceof Array)) {
            // Only one column in Y, turn into an array of the single column.
            y = [y];
        }

        var colorOrder = Color.currentColorTheme.ColorOrder;

        this.arraySpread = function (property, argument) {
            if (Array.isArray(argument)) {
                Really.equal(this.lines.length, argument.length, 'mismatch in number of lines/properties');

                this.lines.forEach(function(line, i) {
                    line[property] = argument[i];
                });
            } else {
                this.lines.forEach(function(line) {
                    line[property] = argument;
                });
            }
        };

        /**
         @property lineWidth
         @type number
         @default 8
         **/
        Object.defineProperty(this, "lineWidth", {
            get: function () {
                return 8;
            },
            set: function(lineWidth) {
                that.arraySpread('width', lineWidth);
                that.redraw();
            }
        });

        /**
         @property lineColor
         **/
        Object.defineProperty(this, "lineColor", {
            get: function () {
                return 8;
            },
            set: function(colors) {
                that.arraySpread('lineColor', colors);
                that.redraw();
            }
        });

        /**
         @property markerShape
         **/
        Object.defineProperty(this, "markerShape", {
            get: function () {
                return 8;
            },
            set: function (mShape) {
                that.arraySpread('markerShape', mShape);
                that.redraw();
            }
        });

        /**
         @property markerSize
         **/
        Object.defineProperty(this, "markerSize", {
            get: function() {
                return 8;
            },
            set: function(mSize) {
                that.arraySpread('markerSize', mSize);
                that.redraw();
            }
        });

        /**
         @property markerSize
         **/
        Object.defineProperty(this, "markerFaceColor", {
            get: function() {
                return 8;
            },
            set: function(mSize) {
                that.arraySpread('faceColor', mSize);
                that.redraw();
            }
        });

        /**
         @property markerSize
         **/
        Object.defineProperty(this, "markerEdgeColor", {
            get: function() {
                return 8;
            },
            set: function(mSize) {
                that.arraySpread('edgeColor', mSize);
                that.redraw();
            }
        });

        Really.assert(arguments.length < 3, 'At most two arguments can be passed to Plot.');

        if (configuration) {
            SafeApply(this, configuration);
        }

        // make the lines
        // for each variable named
        Really.array(x, 'x variable should be an array');
        Really.array(y, 'y variable should be an array');

        for (var column_i = 0; column_i < y.length; column_i += 1) {

            var lineConfiguration = {
                x: x,
                y: y[column_i],
                color: colorOrder[column_i % colorOrder.length],
                width: 1
            };

            var line = new PlotLine(lineConfiguration);
            this.add(line);
            this.lines.push(line);
        }

        Object.seal(this);
    }

    Plot.prototype = Object.create(Axis.prototype);
    return Plot;
});
