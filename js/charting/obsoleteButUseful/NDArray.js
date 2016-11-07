/**
@module periphery/datatypes
*/
define(["../core/utilities/Really"], function (really) {
    "use strict";

    function createNDArray(data) {
        return new NDArray(data);
    }

    /**
     * Multidimensional array class.

     * @function NDArray
     */
    function NDArray(args) {
        Really.assert(args, "expected arguments to NDArray");

        var type = args.type;
        var subType = args.subType;

        var ndims = args.ndims;
        var size = args.size;

        var data;
        var min, max;

        if (args.type === "double") {
            data = args.data;
        } else {
            data = [];
            Really.array(args.data, "expected data to be an array of data, not", JSON.stringify(args.data));
            if (args.data[0].type) {
                // Nested type
                args.data.forEach(function (d) {
                    data.push(createNDArray(d));
                });
            } else {
                data = args.data;
            }
        }


        this.getType = function () {
            return type;
        };

        this.getSubType = function () {
            return subType;
        };

        this.getNumDims = function () {
            return ndims;
        };

        this.getSize = function () {
            return size;
        };

        this.getNumEl = function () {
            var i;
            var numel = 1;
            for (i = 0; i < size.length; i += 1) {
                numel = numel * size[i];
            }
            return numel;
        };

        this.getData = function () {
            return data;
        };

        /**
         * Helper function to look up value based on linear indexing
         * @param index
         * @return value
         * @private
         */
        this._getElemAt = function (index) {
            return data[index];
        };

        this.getElemAt = function () {
            var subscripts = arguments;
            var index = 0;
            var i, j;
            if (subscripts.length === 1) {
                return this._getElemAt(subscripts[0]);
            }
            for (i = subscripts.length - 1; i >= 1; i -= 1) {
                var tmp = subscripts[i];
                for (j = i - 1; j >= 0; j -= 1) {
                    tmp = tmp * this.getSize()[j];
                }
                index += tmp;
            }
            index += subscripts[i];
            return this._getElemAt(index);
        };


        this.getRow = function (rowIndex) {
            var i, result = [];
            for (i = 0; i < (this.getNumEl() / this.getSize()[0]); i += 1) {
                result.push(this.getElemAt(rowIndex, i));
            }
            return result;
        };

        this.getCol = function (colIndex) {
            var i, result = [];
            var start = colIndex * this.getSize()[0];

            for (i = start; i < start + this.getSize()[0]; i += 1) {
                result.push(this._getElemAt(i));
            }
            return result;
        };

        /**
         * Calcualte data range
         * @param index Option column index, if not specified data range is calculated across all
         *          dimensions
         * @return {Array}
         * @private
         */
        this.getDataRange = function (index) {
            if (type !== "double") {
                return [0, 0]; // Limit are not calculated for non-double data
            }
            //TODO: Handle imaginary data
            // Nans are ignored, not propagated.
            min = 1e308;
            max = -min;
            var i;
            var data = index !== undefined ? this.getCol(index) : this.getData();
            for (i = 0; i < data.length; i += 1) {
                var d = data[i];
                if (d < min && !isNaN(d)) {
                    min = d;
                }
                if (d > max && !isNaN(d)) {
                    max = d;
                }
            }
            return [min, max];
        };
    };
    return NDArray;
});