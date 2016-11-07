/**
 @module datatypes/Table
 */
define([], function () {
    "use strict";

    /**
     *
     * @param data
     * @param variableNames
     * @constructor
     */
    function Table(data, variableNames) {
        variableNames = variableNames || [];
        //variableUnits = variableUnits || [];

        this.getData = function(){
            return data;
        };

        this.getVariableByIndex  = function(index) {
            return data[index];
        };

        this.getVariableNameByIndex = function(index) {
            if (variableNames.length === 0) {
                return "Variable " + index;
            } else {
                return variableNames[index];
            }
        };

        this.getNumVariables = function() {
            return data.length;
        }
    }

    return Table;
});
