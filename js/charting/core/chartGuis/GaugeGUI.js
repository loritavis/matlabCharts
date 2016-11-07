define([],
    function() {
        "use strict";

        function GaugeGUI (myGauge) {

            var domNode;

            Object.defineProperty(this, "domNode", {
                get: function() {
                    if (domNode == null) {
                        domNode = document.createElement('div');

                        // here we add a button that sets the charts value to a random number
                        var button = document.createElement('button');
                        button.innerHTML = "Change!";
                        button.onclick = function(){
                            myGauge.value = 100 * Math.random();
                        };
                        domNode.appendChild(button);
                    }
                    return domNode;
                }
            });
        }

        return GaugeGUI;
    }
);