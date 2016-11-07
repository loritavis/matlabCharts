define([
    "MW/Log",
    "charting/Utilities/CanvasEventConnector"
], function (Log, eventConnector) {
    "use strict";

    function WrapperElement(contentsIn) {
        Log.assert(contentsIn, "null chart");
        Log.assert(contentsIn.id, "chart is missing an id");

        // Put one of our charts in a canvas, filling the canvas.
        // and connecting canvas events to the chart.

        // private properties
        var contents = contentsIn;
        var canvas = document.createElement('CANVAS');
        // canvas.backgroundColor = '#dfdfdf';

        // todo: avoid clashes by computing random id
        canvas.id = contentsIn.id;

        canvas.setSize = function (size) {

            var h = size[1];
            var w = size[0];

            canvas.width = w;
            canvas.height = h;
            contents.setSize(w, h);
            canvas.draw();
        };

        canvas.draw = function () {
            var context = canvas.getContext('2d');
            // fill the background
            context.fillStyle = canvas.backgroundColor;
            context.fillRect(0, 0, canvas.width, canvas.height);
            contents.draw(context);
        };

        this.redraw = function () {
            canvas.draw();
        };

        canvas.setClass = function (className) {
            canvas.setAttribute("class", "Chart " + className);
        };

        contents.setParent(this);

        // pass canvas events on through to the contents.
        var connector = new eventConnector(canvas, contents);
        contents.setLocation(0, 0);

        // todo Do we really want to return canvas or the wrapper element?
        return canvas;
    }

    return WrapperElement;
});