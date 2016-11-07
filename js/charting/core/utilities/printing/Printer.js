define([
    "./EPSContext",
    "../Really",
    "dojo/has"
], function (EPSContext, Really, has) {
    "use strict";
    return {
        // returns EPS text
        print: function (chart) {
            Really.assert(chart, 'null chart to print');
            Really.assert(typeof chart.drawChart, 'function', 'cannot find drawChart method');

            if (has('dom')) {
                EPSContext.init(chart.width, chart.height);
                chart.drawChart(EPSContext);
                return EPSContext.getText();
            }
            // cannot print into EPS without canvas
            return null;
        }
    };
});