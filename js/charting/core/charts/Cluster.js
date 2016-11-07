/**
@module core/charts
*/
define([
    "./base/Chart",
    "../glyphs/Markers",
    "../utilities/color/Color",
    "../utilities/Mapper"
], function (Chart, Markers, Color, Map) {
    "use strict";

    /**
    @class Cluster
    */
    function Cluster(parents,markerName,nodeColors,nodeSizes) {

        Chart.apply(this);

        var arcWidth = 0.3;
        var arcColor = 'black';
        var radial = false;

        var marker = new Markers({
            shape:markerName,
            size: Map.Index(nodeSizes),
            faceColor:Color.map(nodeColors)
        });

        // this info about the size of the laid out tree is used to scale the tree to the chart size
        var nLeaves;
        var nLayers;
        var x, y;

        /*
        Object.defineProperty(this, "nodeColor", {
            get: function () {
                return nodeColor;
            },
            set: function (newValue) {
                if (typeof newValue === 'string') {
                    nodeColor = Color.fixedColorSource(newValue);
                } else {
                    nodeColor = newValue;
                }
                this.redraw();
            }
        });
*/

        Object.defineProperty(this, "arcWidth", {
            get: function () {
                return arcWidth;
            },
            set: function (newValue) {
                arcWidth = newValue;
                this.redraw();
            }
        });

        Object.defineProperty(this, "arcColor", {
            get: function () {
                return arcColor;
            },
            set: function (newValue) {
                arcColor = newValue;
                this.redraw();
            }
        });

        Object.defineProperty(this, "radial", {
            get: function () {
                return radial;
            },
            set: function (newValue) {
                radial = newValue;
                this.redraw();
            }
        });

        /*
        Object.defineProperty(this, "nodeSize", {
            get: function () {
                return nodeSize;
            },
            set: function (newValue) {
                // nodeSize = fixedSizeMapper(newValue);
                nodeSize = +newValue; // just convert to a number
                this.redraw();
            }
        });

*/

        this.draw = function (context) {
            var i;

            // these are set to map tree points to screen points
            var xSource,ySource;

            // here we assign a map function that takes x and y and sets xScreen and yScreen
            if (radial) {
                var centerX = this.x + this.width / 2;
                var centerY = this.y + this.height / 2;
                var radius = Math.min(this.width / 2, this.height / 2);
                var rScale = radius / (nLayers - 1);
                var tScale = 2 * Math.PI / nLeaves;

                xSource = {
                    map: function (i) {
                        return centerX + rScale * (nLayers - x[i]) * Math.cos(tScale * y[i]);
                    },
                    length: x.length
                };

                ySource = {
                    map: function (i) {
                        return centerY + rScale * (nLayers - x[i]) * Math.sin(tScale * y[i]);
                    },
                    length: y.length
                };


            } else {
                var xScale = this.width / (nLeaves + 1);
                var yScale = -(this.height - 20) / (nLayers - 1);
                var xOffset = this.x + xScale / 2;
                var yOffset = this.y + this.height - 10 - yScale;

                xSource = {
                    map: function (i) {
                        return xOffset + xScale * x[i];
                    },
                    length: x.length
                };

                ySource = {
                    map: function (i) {
                        return yOffset + yScale * y[i];
                    },
                    length: y.length
                };

            }

            // draw the arcs
            context.beginPath();
            for (i = 0; i < xSource.length; i += 1) {
                if (parents[i] !== 0) {
                    var x1 = xSource.map(i);
                    var y1 = ySource.map(i);
                    var x2 = xSource.map(parents[i] - 1);
                    var y2 = ySource.map(parents[i] - 1);

                    if (radial) {
                        context.moveTo(x1,y1);
                        context.lineTo(x2,y2);
                    } else {
                        var ym = (y1 + y2) / 2;
                        context.moveTo(x1,y1);
                        context.bezierCurveTo(x1, ym, x2, ym, x2, y2);
                    }
                }
            }
            context.strokeStyle = arcColor;
            context.lineWidth = arcWidth;
            context.stroke();

            marker.draw(context,xSource,ySource);
        };

        function treeLayout() {
            var children = [];
            x = [];
            y = [];
            var root;
            var i;
            var nextX;

            // Fill out an array containing the children indices for each node.
            for (i = 0; i < parents.length; i += 1) {
                if (parents[i] === 0) {
                    root = i;
                } else {
                    var parent = parents[i] - 1;
                    if (!children[parent]) {
                        children[parent] = [];
                    }
                    children[parent].push(i);
                }
            }

            function layoutSubTree(childrenArray, root) {
                if (childrenArray[root]) {
                    var children = childrenArray[root];
                    var sumX = 0;
                    var highestY = 0;
                    var i;
                    for (i = 0; i < children.length; i += 1) {
                        var child = children[i];
                        layoutSubTree(childrenArray, child);
                        highestY = Math.max(highestY, y[child]);
                        sumX += x[child];
                    }
                    y[root] = 1 + highestY;
                    x[root] = sumX / children.length;
                } else {
                    y[root] = 1;
                    x[root] = nextX += 1;
                }
            }

            nextX = 0;
            layoutSubTree(children, root);
            nLeaves = nextX;
            nLayers = y[root];


        }

        treeLayout(); // do the layout once at creation.
        Object.seal(this);
    }
    Cluster.prototype = Object.create(Chart.prototype);
    return Cluster;
});
