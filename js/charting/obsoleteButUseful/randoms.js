/**
 @module periphery/datatypes
 */
define(["../core/utilities/Really"], function (really) {
    "use strict";
    /**
     * Generates array of N random numbers in the given range.
     * If no range is specified, uses [0, 1]
     *
     * @method randoms
     * @param {number} n Number of randoms to generate
     * @param {number} [min=0.0] Smallest allowed value
     * @param {number} [max=1.0] Largest allowed value
     * @return array of n numbers between min and max
     */
    function randoms(n, min, max) {
        var k;
        Really.assert(typeof n === 'number', 'n should be a number ' + n);
        Really.assert(n > 0 && n < 1e+6, "number of random numbers " + n + " is out of bounds");
        if ("undefined" === typeof min) {
            min = 0.0;
            max = 1.0;
        } else if ("undefined" === typeof max) {
            max = min;
            min = 0.0;
        }
        Really.assert(typeof min === 'number', 'min should be a number ' + min);
        Really.assert(typeof max === 'number', 'max should be a number ' + max);
        Really.assert(min <= max, "invalid min", min, "and max", max);

        var range = max - min;
        var values = [];
        for (k = 0; k < n; k += 1) {
            values[k] = min + Math.random() * range;
        }

        return values;
    }

    /** */
    return randoms;
});