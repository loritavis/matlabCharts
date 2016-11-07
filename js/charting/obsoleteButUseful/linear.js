/**
 @module periphery/datatypes
 */
define(["../core/utilities/Really"], function (really) {
    "use strict";
    /** Returns numbers increasing from min to max with given skip
    @function linear */
    function linear(min, max, skip) {
        Really.number(min, "min value should be a number", min);
        Really.number(max, "max value should be a number", max);
        if (typeof skip !== "number") {
            skip = 1;
        }
        Really.assert(skip > 0, "invalid skip", skip, "should be positive");
        Really.assert(min < max, "invalid min", min, "and max", max);
        var values = [];
        var k;
        for (k = min; k <= max; k += skip) {
            values.push(k);
        }
        return values;
    }

    return linear;
});