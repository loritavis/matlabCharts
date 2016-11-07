/**
 @module core/utilities
 */
define([], function () {
    "use strict";

    /**
     * Responsible for deciding font and individual chart component sizes and positions.
     *
     * @class Layout
     */
    var Layout = {};
    var fontFamily = 'verdana';

    // what would be the ideal font size for a chart of this size?
    function chooseFontSize(chartSqueeze) {
        var preferredFontSize = 10;
        var maxFontSize = 20;
        var minFontSize = 6;
        // Based on the size of the chart and the above constants, No font should be larger than this
        maxFontSize = Math.min(maxFontSize, Math.round(preferredFontSize * chartSqueeze));
        if (maxFontSize < minFontSize) {
            maxFontSize = 0;
        }
        return maxFontSize;
    }

    /**
     * 1. pick initial font and gap based on chart size
     * 2. find "stretchy" size based on that font and gap
     * 3. adjust font to meet section constraints
     * 4. recalculate stretchy based on final font
     * 4. calculate "give back" space and adjust gap
     * 5. place everything
     *
     * @param context
     * @param hFormat
     * @param vFormat
     * @param theChart
     */
    Layout.performLayout = function (context, hFormat, vFormat, theChart) {
        var i;

        // 1. pick font and gap based on chart size
        var preferredWidth = 400;
        var preferredHeight = 300;
        var chartSqueeze = (theChart.width + theChart.height) / (preferredWidth + preferredHeight);

        var targetFontSize = chooseFontSize(chartSqueeze);
        var targetHGap = Math.max(1, Math.round(1.3 * chartSqueeze));
        var targetVGap = targetHGap;

        // add up how much space us used up by "fixed size" elements
        var horizontalSpaceUsed = 0;
        var verticalSpaceUsed = 0;

        // and count gaps.
        var nHGaps = 0;
        var nVGaps = 0;

        for (i = 0; i < hFormat.length; i += 1) {
            horizontalSpaceUsed += hFormat[i].widthUsed(targetHGap, targetFontSize, context);
            if (hFormat[i].isGap) {
                nHGaps += 1;
            }
        }
        for (i = 0; i < vFormat.length; i += 1) {
            verticalSpaceUsed += vFormat[i].heightUsed(targetVGap, targetFontSize, context);
            if (vFormat[i].isGap) {
                nVGaps += 1;
            }
        }

        // There should be one element that takes "all the rest"
        // this is that rest.
        var stretchyWidth = theChart.width - horizontalSpaceUsed;
        var stretchyHeight = theChart.height - verticalSpaceUsed;

        // 3. adjust font to meet constraints
        for (i = 0; i < hFormat.length; i += 1) {
            targetFontSize = Math.min(targetFontSize,
                    hFormat[i].fontLimit(targetFontSize, context, theChart, stretchyWidth));
        }
        for (i = 0; i < vFormat.length; i += 1) {
            targetFontSize = Math.min(targetFontSize,
                    vFormat[i].fontLimit(targetFontSize, context, theChart, stretchyHeight));
        }

        // anything less than 6 is not readable, so we don't draw text
        if (targetFontSize < 6) {
            targetFontSize = 0;
            targetHGap = 0;
            targetVGap = 0;
        }

        // recalculate stretchy sizes now that we have the actual font size
        horizontalSpaceUsed = 0;
        verticalSpaceUsed = 0;

        for (i = 0; i < hFormat.length; i += 1) {
            horizontalSpaceUsed += hFormat[i].widthUsed(targetHGap, targetFontSize, context);
        }
        for (i = 0; i < vFormat.length; i += 1) {
            verticalSpaceUsed += vFormat[i].heightUsed(targetVGap, targetFontSize, context);
        }

        // these are the actual sizes that the stretchy elements will take
        stretchyWidth = theChart.width - horizontalSpaceUsed;
        stretchyHeight = theChart.height - verticalSpaceUsed;


        // 5. Some elements have quantized sizes and can't quite fill the stretchy size.
        // they will give some space back to gaps

        var hGiveBack = 0;
        var vGiveBack = 0;

        for (i = 0; i < hFormat.length; i += 1) {
            hGiveBack += hFormat[i].hGiveBack(stretchyWidth);
        }
        for (i = 0; i < vFormat.length; i += 1) {
            vGiveBack += vFormat[i].vGiveBack(stretchyHeight);
        }

        // The gap size takes up any give back
        var actualHGapSize = targetHGap + Math.floor(hGiveBack / nHGaps);
        var actualVGapSize = targetVGap + Math.floor(vGiveBack / nVGaps);

        //6. place everything
        var right = theChart.x + 0.5;
        for (i = 0; i < hFormat.length; i += 1) {
            right = hFormat[i].hPlace(right, actualHGapSize, context, targetFontSize);
        }
        var top = theChart.y + 0.5;
        for (i = 0; i < vFormat.length; i += 1) {
            top = vFormat[i].vPlace(top, actualVGapSize, context);
        }

        // for diagnosing layout issues, uncomment to see layout positions
        /*
         if (true) {
         context.beginPath();
         for (i = 0; i < hFormat.length; i += 1) {
         context.moveTo(hFormat[i].rightX, theChart.y);
         context.lineTo(hFormat[i].rightX, theChart.y + theChart.height);
         }
         for (i = 0; i < vFormat.length; i += 1) {
         context.moveTo(theChart.x, vFormat[i].topY);
         context.lineTo(theChart.x + theChart.width, vFormat[i].topY);
         }
         context.lineWidth = 1;
         context.strokeStyle = '#F00';
         context.stroke();
         }
         */
    };

    Layout.drawStackedString = function (context, source, hEntry, vEntry) {
        context.textAlign = "right";
        context.textBaseline = "middle";
        if (hEntry.fontSize > 0) {
            context.font = hEntry.fontSize + 'px ' + fontFamily;
            var j;
            for (j = 0; j < source.length; j += 1) {
                var y = vEntry.topY + vEntry.height / 2 + j * (vEntry.height + vEntry.gap);
                context.fillText(source.map(j), hEntry.rightX, y);
            }
        }
    };

    Layout.drawStringRow = function (context, source, hEntry, vEntry) {
        context.textAlign = "center";
        context.textBaseline = "top";
        var N = source.length;
        var left = hEntry.rightX - hEntry.width * N - hEntry.gap * (N - 1);
        if (vEntry.fontSize > 0) {
            context.font = vEntry.fontSize + 'px ' + fontFamily;
            var j;
            for (j = 0; j < N; j += 1) {
                var x = left + j * (hEntry.width + hEntry.gap) + hEntry.width / 2;
                context.fillText(source.map(j), x, vEntry.topY);
            }
        }
    };

    function maxStringWidth(context, fontSize, stringSource) {
        var maxWidth = 0;
        context.font = fontSize + 'px verdana';
        var i;
        for (i = 0; i < stringSource.length; i += 1) {
            var metrics = context.measureText(stringSource.map(i));
            if (metrics.width > maxWidth) {
                maxWidth = metrics.width;
            }
        }
        return maxWidth;
    }

    Layout.gap = function () {
        function Gap() {
            this.heightUsed = function (gap) {
                return gap;
            };
            this.widthUsed = function (gap) {
                return gap;
            };
            this.fontLimit = function (fontSize) {
                return fontSize;
            };
            this.vGiveBack = function () {
                return 0;
            };
            this.hGiveBack = function () {
                return 0;
            };
            this.hPlace = function (right, gapSize) {
                this.rightX = right + gapSize;
                return this.rightX;
            };
            this.vPlace = function (top, gapSize) {
                this.topY = top;
                return top + gapSize;
            };
            this.isGap = true;
        }

        return new Gap();
    };

    Layout.vRuler = function (ruler) {
        function LayoutStyle() {
            this.heightUsed = function () {
                return 0;
            };
            this.widthUsed = function (gap, fontSize, context) {
                ruler.fontSize = fontSize;
                return ruler.getRequiredWidth(context);
            };
            this.fontLimit = function (targetFontSize, context, theChart) {
                var width = ruler.getRequiredWidth(context);
                var maxWidth = 0.5 * theChart.width;
                if (width > maxWidth) {
                    return targetFontSize * maxWidth / width;
                }
                return targetFontSize;
            };
            this.vGiveBack = function () {
                return 0;
            };
            this.hGiveBack = function () {
                return 0;
            };
            this.hPlace = function (right, gapSize, context) {
                this.rightX = right + ruler.getRequiredWidth(context);
                return this.rightX;
            };
            this.vPlace = function (top, gapSize) {
                this.topY = top;
                return top + gapSize;
            };
            this.isGap = false;
        }

        return new LayoutStyle();
    };

    Layout.hRuler = function (ruler) {
        function LayoutStyle() {
            this.heightUsed = function (gap, fontSize, context) {
                ruler.fontSize = fontSize;
                return ruler.getRequiredHeight(context);
            };
            this.widthUsed = function () {
                return 0;
            };
            this.fontLimit = function (targetFontSize) {
                return targetFontSize;
            };
            this.vGiveBack = function () {
                return 0;
            };
            this.hGiveBack = function () {
                return 0;
            };
            this.hPlace = function (right) {
                this.rightX = right;
                return this.rightX;
            };
            this.vPlace = function (top, gapSize, context) {
                this.topY = top;
                return top + ruler.getRequiredHeight(context);
            };
            this.isGap = false;
        }

        return new LayoutStyle();
    };

    Layout.main = function () {
        function Main() {
            this.heightUsed = function () {
                return 0;
            };
            this.widthUsed = function () {
                return 0;
            };
            this.fontLimit = function (targetFontSize) {
                return targetFontSize;
            };
            this.vGiveBack = function (height) {
                this.height = height;
                return 0;
            };
            this.hGiveBack = function (width) {
                this.width = width;
                return 0;
            };
            this.hPlace = function (right) {
                this.rightX = right + this.width;
                return this.rightX;
            };
            this.vPlace = function (top) {
                this.topY = top;
                return top + this.height;
            };
            this.isGap = false;
        }

        return new Main();
    };

    Layout.stringStack = function (strings) {
        function StringStack() {
            this.heightUsed = function () {
                return 0;
            };
            this.widthUsed = function (gap, fontSize, context) {
                return maxStringWidth(context, fontSize, strings);
            };
            this.fontLimit = function (fontSize, context, theChart, stretchyHeight) {
                var maxFont = fontSize;

                // scale the target font size so that the width of this element is no more than
                // 1/2 of the width of the entire chart
                var width = maxStringWidth(context, fontSize, strings);
                var maxWidth = 0.5 * theChart.width;
                if (width > maxWidth) {
                    maxFont = fontSize * maxWidth / width;
                }
                // how much vertical space per element
                var nRows = strings.length;
                var spacePerElement = stretchyHeight / nRows;
                this.gap = Math.max(1, Math.round(spacePerElement * 0.1));
                this.height = Math.floor(spacePerElement - this.gap);

                // instead of dropping to zero, very thin heights lose gap and scale continuously
                if (this.height < 1) {
                    this.gap = 0;
                    this.height = spacePerElement;
                }

                // Adjust the font to fit the elements
                maxFont = Math.min(maxFont, this.height);

                return maxFont;
            };
            this.vGiveBack = function (height) {
                var nRows = strings.length;
                var spacePerElement = height / nRows;
                this.gap = Math.max(1, Math.round(spacePerElement * 0.1));
                this.height = Math.floor(spacePerElement - this.gap);

                // instead of dropping to zero, very thin heights lose gap and scale continuously
                if (this.height < 1) {
                    this.gap = 0;
                    this.height = spacePerElement;
                }

                return height - (nRows * this.height + (nRows - 1) * this.gap);

            };
            this.hGiveBack = function () {
                return 0;
            };
            this.hPlace = function (left, gapSize, context, fontSize) {
                this.rightX = left + maxStringWidth(context, fontSize, strings);
                this.fontSize = fontSize;
                return this.rightX;
            };
            this.vPlace = function (top) {
                this.topY = top;
                var nRows = strings.length;
                return top + nRows * this.height + (nRows - 1) * this.gap;
            };
            this.isGap = false;
        }

        return new StringStack();
    };

    Layout.stringRow = function (strings) {
        function StringRow() {
            this.heightUsed = function (gap, fontSize) {
                this.fontSize = fontSize;
                return fontSize;
            };
            this.widthUsed = function (gap) {
                return gap;
            };
            this.fontLimit = function (targetFontSize) {
                return targetFontSize;
            };
            this.vGiveBack = function () {
                return 0;
            };
            this.hGiveBack = function (width) {
                // how much vertical space per element
                var nCols = strings.length;
                var nGaps = nCols - 1;

                // gaps want 5%, but at least one pixel
                var gapSpace = Math.round(width * 0.05 / nGaps);
                this.gap = Math.max(1, gapSpace);

                // leaving the rest for elements
                var spaceForElements = width - nGaps * this.gap;
                this.width = Math.floor(spaceForElements / nCols);

                // instead of dropping to zero, very thin widths lose gap and scale continuously
                if (this.width < 1) {
                    this.gap = 0;
                    this.width = Math.floor(width / nCols);
                }

                return width - (nCols * this.width + nGaps * this.gap);
            };
            this.hPlace = function (right) {
                var nCols = strings.length;
                var nGaps = nCols - 1;
                this.rightX = right + (nCols * this.width + nGaps * this.gap);
                return this.rightX;
            };
            this.vPlace = function (top) {
                this.topY = top;
                return top + this.fontSize;
            };
            this.isGap = false;
        }

        return new StringRow();
    };

    Layout.hString = function () {
        function HString() {
            this.heightUsed = function (gap, fontSize) {
                this.fontSize = fontSize;
                return fontSize;
            };
            this.widthUsed = function () {
                return 0;
            };
            this.fontLimit = function (fontSize) {
                return fontSize;
            };
            this.vGiveBack = function () {
                return 0;
            };
            this.hGiveBack = function () {
                return 0;
            };
            this.hPlace = function (right, gapSize) {
                this.rightX = right + gapSize;
                return this.rightX;
            };
            this.vPlace = function (top) {
                this.topY = top;
                return top + this.fontSize;
            };
            this.isGap = false;
        }

        return new HString();
    };

    Layout.vString = function () {
        function VString() {
            this.heightUsed = function () {
                return 0;
            };
            this.widthUsed = function (gap, fontSize) {
                this.fontSize = fontSize;
                return fontSize;
            };
            this.fontLimit = function (fontSize) {
                return fontSize;
            };
            this.vGiveBack = function () {
                return 0;
            };
            this.hGiveBack = function () {
                return 0;
            };
            this.hPlace = function (right) {
                this.rightX = right + this.fontSize;
                return this.rightX;
            };
            this.vPlace = function (top) {
                this.topY = top;
                return top;
            };
            this.isGap = false;
        }

        return new VString();
    };

    Object.seal(Layout);
    return Layout;
});