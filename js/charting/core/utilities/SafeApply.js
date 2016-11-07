/**
 @module core/utilities
 */
define(["./Really"], function (Really) {
    "use strict";

    /**
     * @function checkProperties
     * @private
     */
    function checkProperties(toObject, configuration) {
        Object.keys(configuration).forEach(function (key) {
            if (!toObject.hasOwnProperty(key)) {
                throw new Error('Invalid property name ' + key);
            }
        });
    }

    /**
     * Sets all properties from configuration object onto toObject
     * if a property already exists.
     *
     * Otherwise throws an exception, the property existence for all
     * properties in configuration happens first. If any does not exist,
     * object is left unchanged.
     *
     * @function safeApply
     * @return object with applied configuration
     */
    function safeApply(toObject, configuration) {
        Really.assert(toObject, 'missing object');
        Really.assert(configuration, 'missing configuration');
        checkProperties(toObject, configuration);

        Object.keys(configuration).forEach(function (key) {
            toObject[key] = configuration[key];
        });
        return toObject;
    }

    /** */
    return safeApply;
});