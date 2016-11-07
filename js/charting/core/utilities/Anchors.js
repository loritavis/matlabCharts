/**
 * @module core/utilities
 */
define([], function () {
    "use strict";

    /**
     @class Anchors
     */
    var Anchors = {};

    Anchors.anchorLeft = function (ruler) {
        return function () {
            return ruler.screenRange[0];
        };
    };

    Anchors.anchorRight = function (ruler) {
        return function () {
            return ruler.screenRange[1];
        };
    };

    Anchors.anchorTop = function (ruler) {
        return function () {
            return ruler.screenRange[0];
        };
    };

    Anchors.anchorBottom = function (ruler) {
        return function () {
            return ruler.screenRange[1];
        };
    };

    Anchors.anchorData = function (ruler, value) {
        return function () {
            return 0.5 + Math.floor(ruler.map(value));
        };
    };

    Anchors.anchorWidth = function (chart, value) {
        return function () {
            var size = chart.getSize();
            var location = chart.getLocation();
            return location.x + size.width * value;
        };
    };

    Anchors.anchorHeight = function (chart, value) {
        return function () {
            var size = chart.getSize();
            var location = chart.getLocation();
            return location.y + size.height * value;
        };
    };

    return Anchors;
});
