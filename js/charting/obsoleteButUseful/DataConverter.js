/**
@module periphery/datatypes
*/
define([
    "./NDArray",
    "./Table"
], function (NDArray, Table) {
    "use strict";

    /**
    @class DataConverter
    */
    var _convertToTable = function (data) {
        return new Table(data);
    };

    return {
        // Convert args to respective datatypes
        parseArgs: function (args) {
            if (args.type === "table") {
                console.log("converting to table");
                args = _convertToTable(args);
            }
            return args;
        }
    };
});