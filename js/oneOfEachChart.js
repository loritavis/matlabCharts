require([], function () {
    "use strict";

    function demoKnob() {
        require(["charting/core/charts/knobs/Knob"],
            function (Knob) {
                var chart = new Knob();
                chart.width = 300;
                chart.height = 300;
                chart.backgroundColor = '#bbb';
                chart.startingValue = 10;
                chart.endingValue = 80;
                chart.value = 20;
                document.body.appendChild(chart.domNode);
            })
    }

    function demoCluster() {
        require(["charting/core/charts/Cluster"],
            function (Cluster) {
                var parents = [0, 1, 1, 2, 2, 3, 3, 3, 4, 4];
                var colors = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
                var sizes = [1, 3, 2, 3, 2, 5, 2, 6, 4, 7];
                var chart = new Cluster(parents, "diamond", colors, sizes);
                chart.arcColor = "red";
                chart.arcWidth = 3;
                document.body.appendChild(chart.domNode);
            })
    }

    function demoGauge() {
        require(["charting/core/charts/knobs/Gauge"],
            function (Gauge) {
                var chart = new Gauge(55);
                chart.width = 300;
                chart.height = 300;
                chart.backgroundColor = '#bbb';
                chart.value = 20;
                chart.color = '#F49';
                chart.ticks = [0, 20, 40, 60, 70, 80, 90, 100];
                document.body.appendChild(chart.domNode);
            })
    }

    function demoPlot() {
        require([
            "charting/datatypes/RandomData",
            "charting/core/charts/Plot"],
            function (RandomData, Plot) {
                var x = RandomData.randomArray(10);
                var y = RandomData.randomArray(10);
                var chart = new Plot(x, y);
                // exercise a Plot property
                chart.lineWidth = 2;
                // A Plot IS an Axis, so axis properties work
                chart.title = 'Some Fancy Stuff!';
                chart.xLabel = 'Quanta spin decay factor';
                chart.yLabel = 'Radiation Due to Spin Dephasing';
                // an Axis is a Chart so chart properties work
                chart.width = 300;
                chart.height = 300;
                document.body.appendChild(chart.domNode);
            })
    }

    function demoPolar() {
        require(["charting/core/charts/Polar"],
            function (Polar) {

                var radius = [10, 30, 20, 30, 50, 40, 50, 70, 40];
                var angle = [1, 2, 3, 4, 5, 6, 7, 8, 9];
                var chart = new Polar(radius, angle);
                chart.width = 300;
                chart.height = 300;
                chart.backgroundColor = '#ddd';
                document.body.appendChild(chart.domNode);
            })
    }

    function demoPie() {
        require(["charting/core/charts/PieChart"],
            function (Pie) {
                var wedges = [1, 2, 3, 4, 5, 6, 7, 8, 9];
                var chart = new Pie(wedges);
                chart.width = 300;
                chart.height = 300;
                document.body.appendChild(chart.domNode);
            })
    }

    function demoAnnotations() {
        require([
            "charting/core/charts/Plot",
            "charting/core/annotations/Callout",
            "charting/core/annotations/HMeasure",
            "charting/core/annotations/Rectangle",
            "charting/core/utilities/Anchors"],
            function (Plot, Callout, HMeasure, Rectangle, Anchor) {
                var x = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
                var y = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
                var chart = new Plot(x, y);
                chart.width = 300;
                chart.height = 300;
                chart.title = 'Here are some annotations to play with.';
                var xAnchor = Anchor.anchorData(chart.dataSpace.hRuler, 4);
                var yAnchor = Anchor.anchorData(chart.dataSpace.vRuler, 0.696);
                var callout = new Callout(xAnchor, yAnchor, 'A Callout');
                chart.addAnnotation(callout);
                var xAnchor1 = Anchor.anchorData(chart.dataSpace.hRuler, 3);
                var yAnchor1 = Anchor.anchorData(chart.dataSpace.vRuler, 3);
                var xAnchor2 = Anchor.anchorData(chart.dataSpace.hRuler, 6);
                var yAnchor2 = Anchor.anchorData(chart.dataSpace.vRuler, 6);
                var hMeasure = new HMeasure(xAnchor1, yAnchor1, xAnchor2, yAnchor2, 'That Far');
                chart.addAnnotation(hMeasure);
                var xAnchorLeft = Anchor.anchorData(chart.dataSpace.hRuler, 3);
                var xAnchorRight = Anchor.anchorData(chart.dataSpace.hRuler, 6);
                var yAnchorTop = Anchor.anchorData(chart.dataSpace.vRuler, 6);
                var yAnchorBottom = Anchor.anchorData(chart.dataSpace.vRuler, 3);
                var rectangle = new Rectangle(xAnchorLeft, xAnchorRight, yAnchorTop, yAnchorBottom);
                chart.addAnnotation(rectangle);
                document.body.appendChild(chart.domNode);
                return chart;
            })
    }

    function demoTrellis() {
        require([
            "charting/datatypes/RandomData",
            "charting/core/charts/Trellis"],
            function (RandomData, Trellis) {
                var table = RandomData.randomTable(5, 100);
                var chart = new Trellis(table);
                chart.width = 1200;
                chart.height = 800;
                document.body.appendChild(chart.domNode);
                return table;
            })
    }

    function demoHBar() {
        require([
            "charting/Utilities/ReadJSONFile",
            "charting/core/charts/HBar"],
            function (readJSON, HBar) {
                var animals = readJSON("js/data/animals.json");
                var chart = new HBar(animals.days, animals.names);
                chart.width = 300;
                chart.height = 300;
                chart.backgroundColor = '#ffc';
                chart.Color = '#66c';
                document.body.appendChild(chart.domNode);
            })
    }

    function demoParallelPlot() {
        require([
            "charting/datatypes/RandomData",
            "charting/core/charts/ParallelPlot"],
            function (RandomData, ParallelPlot) {
                var table = RandomData.randomTable(8, 100);
                var chart = new ParallelPlot(table);
                chart.width = 300;
                chart.height = 300;
                chart.font = '23px serif';
                document.body.appendChild(chart.domNode);
            })
    }

    function demoContainer() {
        require([
            "charting/core/charts/Container",
            "charting/core/charts/knobs/Knob"],
            function (Container, Knob) {
                var chart = new Container();
                chart.width = 500;
                chart.height = 400;
                var k1 = new Knob();
                k1.backgroundColor = "blue";
                var k2 = new Knob(50);
                chart.add(k1);
                chart.add(k2);
                document.body.appendChild(chart.domNode);
            })
    }

    function demoColorGrid() {
        require([
            "charting/datatypes/RandomData",
            "charting/core/charts/ColorGrid"],
            function (RandomData, ColorGrid) {
                var table = RandomData.randomTable(8, 5);
                var chart = new ColorGrid(table);
                chart.width = 300;
                chart.height = 300;
                document.body.appendChild(chart.domNode);
            })
    }

    function demoColorBar() {
        require([
            "charting/datatypes/RandomData",
            "charting/core/charts/ColorBar"],
            function (RandomData, ColorBar) {
                var x = [1,2,3,4,5,6,7,8,9];
                var chart = new ColorBar(x);
                chart.width = 160;
                chart.height = 300;
                document.body.appendChild(chart.domNode);
            })
    }

    demoAnnotations();
    demoKnob();
    demoGauge();
    demoCluster();
    demoColorBar();
    demoColorGrid();
    demoContainer();
    demoHBar();
    demoParallelPlot();
    demoPie();
    demoPlot();
    demoPolar();
    demoTrellis();

});