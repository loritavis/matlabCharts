/**
 @module periphery/datatypes
 */
define([
    "./Categorical",
    "./NDArray",
    "../core/utilities/Really"
], function (Categoorical, NDArray, really) {
    "use strict";
    /**
     @class TableCol
     */
    return function (args) {
        Really.assert(args.data, "missing args.data property");
        if (args.data.type === "categorical") {
            Categoorical.apply(this, [args.data]);
        } else {
            NDArray.apply(this, [args.data]);
        }

        var colName = args.colName;
        var description = args.description;
        var units = args.units;
        Really.string(colName, "missing column name");
        Really.string(description, "missing column description");
        Really.string(units, "missing column units");

        this.getColName = function () {
            return colName;
        };

        this.getDescription = function () {
            return description;
        };

        this.getUnits = function () {
            return units;
        };
    };
});