/**
    @module core/charts
*/
define([
    "./base/Chart",
    "../utilities/color/Color",
    "../utilities/Really"
], function (Chart, Color, Really) {
    "use strict";

    /**
    @class PieChart
    */
    function PieChart(data) {
        Really.assert(data, "null data for pie chart, should be array of numbers");
        Really.assert(Array.isArray(data), "pie chart data is not an array", data);
        Really.assert(data.length > 0, "pie chart data is empty");

        //A pie chart is a chart
        Chart.apply(this);

        this.innerRadius = 0;
        this.colors = Color.colorOrder();

        // special handling from chart host... Need to fix???
        if ((data.length === 1) && Array.isArray(data[0])) {
            data = data[0];
        }

        this.draw = function (context) {
            // The center of the pie
            var centerX = this.x + this.width / 2;
            var centerY = this.y + this.height / 2;

            var radius = Math.min(this.width / 2, this.height / 2) - 3 - 20;

            // add up all the data
            var sumData = 0;
            var i;
            for (i = 0; i < data.length; i += 1) {
                sumData += data[i];
            }

            context.strokeStyle = 'black';
            context.lineWidth = 1;
            context.font = "16px serif";

            var anglePerUnit = 2 * Math.PI / sumData;
            var startingAngle = -Math.PI / 2;
            for (i = 0; i < data.length; i += 1) {

                var angle = anglePerUnit * data[i];
                var endAngle = startingAngle + angle;
                var midAngle = startingAngle + angle / 2;

                context.fillStyle = this.colors.get(i);
                context.beginPath();
                context.moveTo(centerX, centerY);
                context.lineTo(centerX + radius * Math.cos(startingAngle), centerY + radius * Math.sin(startingAngle));
                context.arc(centerX, centerY, radius, startingAngle, endAngle, false);
                context.lineTo(centerX, centerY);
                context.fill();
                context.stroke();
                startingAngle = endAngle;

                if (this.labelOut) {
                    if (midAngle < Math.PI / 2) {
                        context.textAlign = "left";
                    } else {
                        context.textAlign = "right";
                    }
                    if (midAngle < Math.PI / 4) {
                        context.textBaseline = "bottom";
                    } else {
                        context.textBaseline = "top";
                    }

                    var labelRadius = radius * 1.02;
                    context.fillStyle = 'black';
                    context.fillText(this.labelOut.get(i), centerX + labelRadius * Math.cos(midAngle), centerY + labelRadius * Math.sin(midAngle));
                    context.beginPath();
                    context.arc(centerX + labelRadius * Math.cos(midAngle), centerY + labelRadius * Math.sin(midAngle), 2, 0, 6.29, false);
                    context.fill();
                }

                context.fillStyle = 'white';
                context.beginPath();
                context.arc(centerX, centerY, this.innerRadius * radius, 0, 6.29, false);
                context.fill();
                context.stroke();

                if (this.centerLabel) {
                    context.textAlign = "center";
                    context.textBaseline = "middle";
                    context.fillStyle = 'black';
                    context.fillText(this.centerLabel, centerX, centerY);
                }
            }
        };
        Object.seal(this);
    }
    PieChart.prototype = Object.create(Chart.prototype);
    return PieChart;
});