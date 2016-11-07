/**
 @module core/charts
 */
define([
    // "../Utilities/WrapperElement",
    "charting/3rdparty/d3.v2",
    "./base/Chart"
], function (d3, Chart) {
    "use strict";

    /**
     @class Graph
     */
    function Graph(nodeI, nodeJ, value, index) {
        Chart.apply(this);
        var that = this;

        var nodeColor = 'steelblue';
        var edgeColor = "black";
        this.hitNodeIndex = null;
        this.hitTolerance_Pixels = 10;

        var nodes;
        var forceLayout = d3.layout.force();

        this.draw = function (context) {
            // draw links
            context.strokeStyle = edgeColor;
            context.beginPath();
            var lines = forceLayout.links();
            var i;

            for (i = 0; i < lines.length; i += 1) {
                var line = lines[i];
                var source = line.source;
                var target = line.target;
                context.moveTo(this.x + source.x, this.y + source.y);
                context.lineTo(this.x + target.x, this.y + target.y);
            }
            context.stroke();

            // draw nodes
            context.fillStyle = nodeColor;
            context.beginPath();

            for (i = 0; i < nodes.length; i += 1) {
                var node = nodes[i];
                context.moveTo(this.x + node.x, this.y + node.y);
                context.arc(this.x + node.x, this.y + node.y, 4.5, 0, 2 * Math.PI);
            }
            context.fill();
        };

        this.onSizeChanged = function () {
            forceLayout.size([this.width, this.height]);
            forceLayout.resume();
        };

        this.eventHandler = this;

        this.mouseDownHandler = function (event) {
            var i;
            var mouseX = event.x - this.x;
            var mouseY = event.y - this.y;
            this.hitNodeIndex = null;
            for (i = 0; i < nodes.length; i += 1) {
                if (Math.abs(mouseX - nodes[i].x) < this.hitTolerance_Pixels) {
                    if (Math.abs(mouseY - nodes[i].y) < this.hitTolerance_Pixels) {
                        this.hitNodeIndex = i;
                        break;
                    }
                }
            }
            this.redraw();
        };

        this.mouseShiftDragHandler = function (event, dx, dy) {
            forceLayout.stop();
            var charge = forceLayout.charge();
            var linkDistance = forceLayout.linkDistance()();
            forceLayout.charge(charge + charge * (dx / 100));
            forceLayout.linkDistance(linkDistance + linkDistance * dy);
            forceLayout.start();
        };

        this.mouseDragHandler = function (event) {
            if (this.hitNodeIndex !== null) {

                forceLayout.stop();
                nodes[this.hitNodeIndex].x = event.x - this.x;
                nodes[this.hitNodeIndex].y = event.y - this.y;
                forceLayout.start();
            }
        };

        this.mouseUpHandler = function (event) {
        };

        Object.defineProperty(this, "nodeColor", {
            get: function () {
                return nodeColor;
            },
            set: function (newValue) {
                nodeColor = newValue;
                that.redraw();
            }
        });

        Object.defineProperty(this, "edgeColor", {
            get: function () {
                return edgeColor;
            },
            set: function (newValue) {
                edgeColor = newValue;
                that.redraw();
            }
        });

        forceLayout.charge(-10);
        forceLayout.linkDistance(20);

        var initLinks = [];
        var i;
        nodeI = nodeI.data;
        nodeJ = nodeJ.data;
        index = index.data;

        for (i = 0; i < nodeI.length; i += 1) {
            var g = {source: nodeI[i], target: nodeJ[i]};
            initLinks.push(g);
        }

        var initNodes = [];
        for (i = 0; i < index.length; i += 1) {
            var n = {group: 1, name: index[i]};
            initNodes.push(n);
        }

        forceLayout.nodes(initNodes);
        forceLayout.links(initLinks);
        forceLayout.on("tick", this.redraw);
        forceLayout.size([this.width, this.height]);

        nodes = forceLayout.nodes();
        forceLayout.start();

        // Object.seal(this);
    }

    Graph.prototype = Object.create(Chart.prototype);
    return Graph;
});
