/**
 @module core/utilities
 */
define([], function () {
    "use strict";
    /**
     * Utility class used to break the execution flow. Several methods provided for convenience.
     * In some environments (Chrome) console.assert only shows an error messages, but allows
     * the execution to proceed. We need to stop the execution if condition is false. This module
     * makes sure to throw the actual exception, stopping the execution.
     *

     function worker(filename, callback) {
            really.string(filename, 'expected filename string');
            really.func(callback, 'expected callback function');
            ...
        }

     * @class really
     */
    var really = {
        /**
         * Throws an assertion AssertionError with an actual error message.
         * @private
         * @param message
         */
        throwAssertion: function (message) {
            throw {
                name: 'AssertionError',
                message: message
            };
        },

        /**
         * Checks if condition is true, if not throws an exception. In some environments,
         * console.assert is enough. Optional arguments after condition will be joined
         * into a string.
         *
         * @param condition True or false condition
         */
        assert: function (condition) {
            var args = [].slice.call(arguments, 1).join(' ');

            console.assert(condition, args);
            if (!condition) {
                this.throwAssertion(args);
            }
        },

        /**
         * Checks if first argument is equal to expected using ===
         *
         * @param value Computed value
         * @param expected Expected value
         */
        equal: function (value, expected) {
            var args = [].slice.call(arguments, 2).join(' ');

            console.assert(value === expected, args);
            if (value !== expected) {
                this.throwAssertion(args);
            }
        },

        /**
         * Checks if given first argument is array or not.
         *
         * @param potentialArray
         */
        array: function (potentialArray) {
            var args = [].slice.call(arguments, 1).join(' ');
            console.assert(Array.isArray(potentialArray), args);
            if (!Array.isArray(potentialArray)) {
                this.throwAssertion(args);
            }
        },

        /**
         * Checks if given first argument is a string or not.
         *
         * @param s
         */
        string: function (s) {
            var args = [].slice.call(arguments, 1).join(' ');
            console.assert(typeof s === 'string', args);
            if (typeof s !== 'string') {
                this.throwAssertion(args);
            }
        },

        /**
         * Checks if given first argument is a object or not.
         *
         * @param o
         */
        object: function (o) {
            var args = [].slice.call(arguments, 1).join(' ');
            console.assert(typeof o === 'object' && !Array.isArray(o), args);
            if (typeof o !== 'object' || Array.isArray(o)) {
                this.throwAssertion(args);
            }
        },

        /**
         * Checks if given first argument is a number or not.
         *
         * @param n
         */
        number: function (n) {
            var args = [].slice.call(arguments, 1).join(' ');
            console.assert(typeof n === 'number' && !isNaN(n), args);
            if (typeof n !== 'number' || isNaN(n)) {
                this.throwAssertion(args);
            }
        },

        /**
         * Checks if given first argument is > 0 or not
         *
         * @param n
         */
        positive: function (n) {
            var args = [].slice.call(arguments, 1).join(' ');
            console.assert(n > 0, args);
            if (n <= 0.0) {
                this.throwAssertion(args);
            }
        },


        /**
         * Checks if given first argument is a function or not.
         *
         * @param n
         */
        func: function (n) {
            var args = [].slice.call(arguments, 1).join(' ');
            console.assert(typeof n === 'function', args);
            if (typeof n !== 'function') {
                this.throwAssertion(args);
            }
        },

        /**
         * Checks if given first argument is defined
         *
         * @param n
         */
        defined: function (n) {
            var args = [].slice.call(arguments, 1).join(' ');
            console.assert(undefined !== n, args);
            if (undefined === n) {
                this.throwAssertion(args);
            }
        }
    };

    /** */
    return really;
});