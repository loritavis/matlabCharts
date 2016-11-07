/**
 @module core/utilities
 */
define([
    "./Really"
], function (Really) {
    "use strict";

    /**
     Returns smallest item from the given array.

     @function arrays.min
     @input {array}
     @return {item}
     */
    function arrayMin(data) {
        Really.array(data, "input to arrayMin should be an array of numbers");

        var min = 1e308;
        var i;
        for (i = 0; i < data.length; i += 1) {
            var d = data[i];
            if (d < min && !isNaN(d)) {
                min = d;
            }
        }
        return min;
    }

    /**
     Returns largest item from the given array.

     @function arrays.max
     */
    function arrayMax(data) {
        Really.array(data, "input to arrayMax should be an array of numbers");

        var max = -1e308;
        var i;
        for (i = 0; i < data.length; i += 1) {
            var d = data[i];
            if (d > max && !isNaN(d)) {
                max = d;
            }
        }
        return max;
    }

    /**
        Returns min and max of the given numerical array

        @function arrays.range
    */
    function arrayRange(data) {
        Really.array(data, "input to arrayRange should be an array of numbers");

        var max = -1e308;
        var min = 1e308;

        var i;
        for (i = 0; i < data.length; i += 1) {
            var d = data[i];
            if (d > max && !isNaN(d)) {
                max = d;
            }
            if (d < min && !isNaN(d)) {
                min = d;
            }
        }

        return {min:min, max:max};
    }

    return {
        min: arrayMin,
        max: arrayMax,
        range: arrayRange
    };
});