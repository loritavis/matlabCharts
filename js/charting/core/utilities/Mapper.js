/**
 * @module core/utilities
 */
define(["./Arrays"], function (Array) {
    "use strict";

    /**
     Given a value, returns another value

     @class Mapper
     */
    var Mapper = {};

    // The degenerate Mapper always returns the same value.
    Mapper.Constant = function (value) {
        function map() {
            return value;
        }

        return {map: map, length: NaN};
    };

    // The degenerate Mapper always returns the same value.
    Mapper.Identity = function () {
        function map(value) {
            return value;
        }

        return {map: map, length: NaN};
    };

    // map a continuous values in the input range to the output range
    Mapper.Range = function (lowerIn, upperIn, lowerOut, upperOut) {
        var scale = (upperOut - lowerOut) / (upperIn - lowerIn);
        var offset = lowerOut - lowerIn * scale;

        function map(v1) {
            return offset + scale * v1;
        }

        return {map: map, length: NaN};
    };

    // map an index to an array element
    Mapper.Index = function (arrayIn) {
        function map(ix) {
            return arrayIn[ix];
        }

        return {map: map, length: arrayIn.length};
    };

    // apply a function
    Mapper.funApply = function (fun) {
        function map(inputValue) {
            return fun(inputValue);
        }

        return { map: map, length: NaN};
    };

    // map an index to a string representing an array element
    Mapper.String = function (digits) {
        function map(num) {
            return num.toFixed(digits);
        }

        return {map: map, length: NaN};
    };

    // combine two mappings into one by applying the second to the output of the first
    // TODO: Compound could accept any number of mappers, removing the need for nested compound constructions
    Mapper.Compound = function (map1, map2) {
        function map(vIn) {
            return map2.map(map1.map(vIn));
        }

        return {map: map, length: map1.length};
    };


    // map indices into the valueArray to elements of the resultArray
    Mapper.Map = function (valueArray, resultArray) {
        var range = Array.range(valueArray);
        var rangeMapper = Mapper.Range(range.min, range.max, 0, resultArray.length - 1e-12);

        function map(index) {
            var value = valueArray[index];
            var resultIndex = Math.floor(rangeMapper.map(value));
            return resultArray[resultIndex];
        }

        return { map: map, length: valueArray.length };
    };

    Object.seal(Mapper);
    return Mapper;
});