/**
 * @module core/charts
 */
define([
    "../utilities/color/Color",
    "../utilities/Layout",
    "../utilities/Mapper",
    "../utilities/Arrays",
    "../rulers/HRuler",
    "./base/Chart",
    "../utilities/Really"
], function (Color, Layout, Mapper, Arrays, HRuler, Chart, Really) {
    "use strict";

    /**
     * Horizontal bar graph
     * @class HBar
     * @param values [Array] Values to plot
     * @param names [Array] Names for values
     * @constructor
     * todo vertically stacked
     * todo horizontally stacked
     */
    function HBar(values, names) {
        Chart.apply(this);

        // TODO Where should this font decision be made?
        var fontFamily = "verdana";

        var title = "This is a bar chart.";
        var title2 = "More about bar charts.";
        var xLabel = "Days of Gestation";

        Really.assert(values, "undefined values parameter");
        Really.assert(names, "undefined names parameter");

        Really.array(names, "names for HBar is not an array");
        Really.array(values, "values for HBar is not an array");
        Really.equal(names.length, values.length, "names and values length differ");

        var sortOrders = [
            ['names', true], // sort by name alphabetically
            ['names', false],
            ['values', true], // sort by increasing value
            ['values', false],
            ['initial'] // unsorted probably
        ];
        var currentSortOrder = 0;

        this.nextSortOrder = function () {
            Really.array(sortOrders, 'sort orders should be an array');
            currentSortOrder = (currentSortOrder + 1) % sortOrders.length;
            return sortOrders[currentSortOrder];
        };

        var hRuler = new HRuler();
        hRuler.lineColor = null;
        hRuler.tickColor = null;
        hRuler.encloseData = false;

        var dataMax = Arrays.max(values);
        hRuler.dataRange = [0, dataMax];

        var sortOrder = [];

        function resetSort() {
            Really.array(sortOrder, 'sortOrder should be an array');

            // todo measure += 1 vs -= 1
            var i;
            for (i = 0; i < names.length; i += 1) {
                sortOrder[i] = i;
            }
        }

        resetSort();

        Really.equal(sortOrder.length, names.length, "invalid array allocated");

        var nameSource = Mapper.Compound(Mapper.Index(sortOrder), Mapper.Index(names));
        // take the index, look up the sort order, then look up the value, then convert to a string
        var valueSource = Mapper.Compound(Mapper.Index(sortOrder),  Mapper.Compound(Mapper.Index(values), Mapper.String(0)));

        var barColor = '#000';
        var labelColor;
        var gridColor;

        /**
         Bar color
         @property Color
         @default '#000'
         @type string
         */
        Object.defineProperty(this, "Color", {
            get: function () {
                return barColor;
            },
            set: function (newValue) {
                barColor = newValue;
                this.redraw();
            }
        });

        /**
         Values to plot
         @property Values
         @type Array
         */
        Object.defineProperty(this, "Values", {
            get: function () {
                return values;
            },
            set: function (newValue) {
                values = newValue;
                this.redraw();
            }
        });

        /**
         Names for data bars
         @property Names
         @type Array
         */
        Object.defineProperty(this, "Names", {
            get: function () {
                return names;
            },
            set: function (newValue) {
                names = newValue;
                this.redraw();
            }
        });

        // Layout

        // Here we build a description of the vertical structure of the chart
        var vNameStack = Layout.stringStack(nameSource);
        var vhRuler = Layout.hRuler(hRuler);
        var vTitle1 = Layout.hString(title);
        var vTitle2 = Layout.hString(title2);
        var vXLabel = Layout.hString(xLabel);
        var vFormat = [Layout.gap(), vTitle1, vTitle2, Layout.gap(), vNameStack, vhRuler, Layout.gap(), vXLabel, Layout.gap()];

        // and a description of the horizontal structure
        var nameStack = Layout.stringStack(nameSource);
        var valueStack = Layout.stringStack(valueSource);
        var innerGap = Layout.gap();
        var hMain = Layout.main();
        var hFormat = [Layout.gap(), nameStack, Layout.gap(), valueStack, innerGap, hMain, Layout.gap()];

        // calculate the layout
        this.layout = function (context) {
            // Automatic Layout
            Layout.performLayout(context, hFormat, vFormat, this);
            hRuler.baseline = vhRuler.topY;
            hRuler.screenRange = [innerGap.rightX, hMain.rightX];
        };

        this.draw = function (context) {
            var i, value;

            this.layout(context);

            // Choose colors
            var rgb = Color.parseColor(barColor);
            labelColor = Color.lighter(rgb, -0.4);
            gridColor = Color.lighter(rgb, 0.6);
            hRuler.textColor = labelColor;
            hRuler.font = fontFamily;


            // draw the vertical grid lines
            if (hRuler.fontSize !== 0) {
                context.beginPath();
                var xTicks = hRuler.ticks;
                var tickValues = xTicks.values;
                for (i = 0; i < values.length; i += 1) {
                    var x = 0.5 + Math.floor(xTicks.dataToScreenMapper.map(tickValues.map(i)));
                    context.moveTo(x, vNameStack.topY);
                    context.lineTo(x, vhRuler.topY);
                }
                context.strokeStyle = gridColor;
                context.stroke();
            }

            // title & x-label
            context.textAlign = "center";
            context.textBaseline = "top";
            context.fillStyle = 'black';
            context.font = vTitle1.fontSize + 'px ' + fontFamily;
            context.fillText(title, this.x + this.width / 2, vTitle1.topY);
            context.fillText(title2, this.x + this.width / 2, vTitle2.topY);
            context.font = vXLabel.fontSize + 'px ' + fontFamily;
            context.fillText(xLabel, this.x + this.width / 2, vXLabel.topY);

            // bars
            var yOffset = vFormat[4].topY;
            context.fillStyle = barColor;
            for (i = 0; i < sortOrder.length; i += 1) {
                value = values[sortOrder[i]];
                var width = hRuler.map(value) - hRuler.map(0);
                context.fillRect(0.5 + innerGap.rightX, 0.5 + yOffset, width, vNameStack.height);
                yOffset += vNameStack.height + vNameStack.gap;
            }

            // bar labels
            context.fillStyle = labelColor;
            Layout.drawStackedString(context, nameSource, nameStack, vNameStack);

            // bar values
            context.fillStyle = "#644";
            Layout.drawStackedString(context, valueSource, valueStack, vNameStack);

            hRuler.draw(context);
        };

        this.sort = function (onWhat, reverseOrder) {
            Really.assert(onWhat, 'expected sort property');

            resetSort();

            var sortFunctions = {
                names: function (a, b) {
                    return names[a] < names[b] ? -1 : 1;
                },
                values: function (a, b) {
                    return values[b] - values[a];
                },
                initial: function (a, b) {
                    return a - b;
                }
            };

            var comparison = sortFunctions[onWhat];
            Really.func(comparison, 'could not find comparison for', onWhat);
            sortOrder.sort(comparison);
            if (reverseOrder) {
                sortOrder.reverse();
            }

            this.redraw();
        };

        // I am my own event handler!
        this.eventHandler = this;
        this.mouseDownHandler = this.doSort;
        this.doSort();

        Object.seal(this);
    }

    HBar.prototype = Object.create(Chart.prototype);

    HBar.prototype.doSort = function (event) {
        if (event && event.button !== 0) {
            // ignore everything but left mouse click
            return;
        }

        var sortPair = this.nextSortOrder();
        Really.array(sortPair, 'sort pair should be an array');
        this.sort(sortPair[0], sortPair[1]);
    };

    return HBar;
});