/**
 @module periphery/datatypes
 */
define([
    "./Table"
], function(Table) {
    "use strict";
    /**
     @class RandomData
     */
    return {
        /**
         *
         * @param nVariables
         * @param nObservations
         * @returns Table
         */
        randomTable: function(nVariables, nObservations) {
            var data = [];
            for (var i = 0; i < nVariables; i++) {
                data[i] = [];
                for (var j = 0; j < nObservations; j++) {
                    data[i][j] = Math.random();
                }
            }
            return new Table(data);
        },

        randomArray: function(nElements) {
            var data = [];
            for (var j = 0; j < nElements; j++) {
                data[j] = Math.random();
            }
            return data;
        }
    };
});