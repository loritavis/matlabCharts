define(["../charts/knobs/Gauge", "../chartGuis/GaugeGUI"],
    function(Gauge, GaugeGUI) {
        "use strict";

        function ChartManager (data) {

            var chart = new Gauge(data.x);
            var gui = new GaugeGUI(chart);
            var domNode;

            this.getChart = function() {
                return chart;
            };

            Object.defineProperty(this, "domNode", {
                get: function() {
                    if (domNode == null) {
                        domNode = document.createElement('div');
                        domNode.innerHTML = "Here is the Chart Manager GUI stuff.";

                        var button = document.createElement('button');
                        button.innerHTML = "Press Me!";
                        domNode.appendChild(button);

                        var select = document.createElement("select");

                        /* setting an onchange event */
                        select.onchange = function() {
                           gui.domNode.innerHTML += select.selectedIndex;
                       };

                        var option;

                        /* we are going to add two options */
                        /* create options elements */
                        option = document.createElement("option");
                        option.setAttribute("value", "More");
                        option.innerHTML = "More";
                        select.appendChild(option);

                        option = document.createElement("option");
                        option.setAttribute("value", "Less");
                        option.innerHTML = "Less";
                        select.appendChild(option);
                        domNode.appendChild(select);

                        domNode.appendChild(gui.domNode);
                        domNode.appendChild(chart.domNode);
                    }
                    return domNode;
                }
            });
        }

        return ChartManager;
    }
);