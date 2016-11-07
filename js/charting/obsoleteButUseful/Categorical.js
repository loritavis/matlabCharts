/**
@module periphery/datatypes
*/
define([
    "./NDArray",
    "../core/utilities/Really"
], function (NDArray, really) {
    "use strict";
    /**
     * Extends multidimensional arrays by providing categorical labeling
     * @class Categorical
     * @extends NDArray
     */
    return function (args) {
        NDArray.apply(this, arguments);
        var levels = args.levels;
        var labels = args.labels;
        Really.array(levels, 'Categorical levels should be an array, not', levels);
        Really.array(labels, 'Categorical levels should be an array, not', labels);

        this.getLevels = function () {
            return levels;
        };

        this.getLabels = function () {
            return labels;
        };
    };
});