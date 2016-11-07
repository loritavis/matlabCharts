/**
 * @module core/utilities
 */
define([], function() {
    "use strict";

    /** Binds a property from one object to property in another
    @function linkProperty
    */
    function linkProperty (oldObject, oldPropertyName, newObject, newPropertyName) {
        // give newObject a property that maps to oldObject
        Object.defineProperty(newObject, newPropertyName, {
            get: function() {
                return oldObject[oldPropertyName];
            },
            set: function(newValue) {
                oldObject[oldPropertyName] = newValue;
            }
        });
    }


    return {linkProperty : linkProperty};
});