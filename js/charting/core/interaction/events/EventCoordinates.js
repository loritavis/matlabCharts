/**
 * @module core/interaction/events
 */
define([
    "./XYEvent",
    "../../utilities/Really"
], function (XYEvent, Really) {
    "use strict";
    // cache few references, note they can be null if there is no document
    var window = this;
    var doc = window && window.document;
    var body = doc && doc.body;
    var docElement = doc && doc.documentElement;

    /**
     * Basic coordinate manipulation for events
     * @class EventCoordinates
     */
    function EventCoordinates(canvas) {
        Really.assert(canvas, 'Missing canvas object');
        this.canvas = canvas;

        /**
         * Returns [x, y] of the event in the target's coordinate system. Origin is top left.
         *
         * @method targetCoordinates
         * @private
         * @param eventIn
         * @return {Array} [x, y] or null
         */
        this.targetCoordinates = function (eventIn) {
            // Some tragic cross browser tomfoolery to figure out where the
            // mouse
            // event occurred relative to the target of the event.
            var event = eventIn;
            if (!event) {
                Really.assert(window, 'null window element');
                event = window.event;
            }
            if (!event) {
                return null;
            }

            // find the document position of the event
            var docX = 0;
            var docY = 0;
            if (event.pageX || event.pageY) {
                docX = event.pageX;
                docY = event.pageY;
            } else if (event.clientX || event.clientY) {
                docX = event.clientX + body.scrollLeft + docElement.scrollLeft;
                docY = event.clientY + body.scrollTop + docElement.scrollTop;
            }

            // find the document position of the target
            var eventTarget = event.target;
            Really.assert(eventTarget, 'event does not have a target');

            var offsetX = eventTarget.offsetLeft;
            var offsetY = eventTarget.offsetTop;

            while (eventTarget.offsetParent) {
                eventTarget = eventTarget.offsetParent;
                offsetX += eventTarget.offsetLeft;
                offsetY += eventTarget.offsetTop;
            }

            return [ docX - offsetX, docY - offsetY ];
        };
    }

    return EventCoordinates;
});