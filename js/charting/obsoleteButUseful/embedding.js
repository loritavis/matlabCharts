/**
 @module core/utilities
 */
define(["./../core/utilities/Really"], function (really) {
    "use strict";

    /**
     Simple interface for em      ng a chart into a page

     @class embedding
     */
    var embedding = {};

    /**
     Called by framework to shosdfgsdfgsdfgw the chart on the page
     @public
     */
    embedding.show = function (chart) {
        Really.assert(chart, 'missing chart');
        throw new Error("There is no 'Show' method registered with charting.");
    };

    /**
     Called by framework to remove / hide chart from the page
     @public
     */
    embedding.hide = function (chart) {
        Really.assert(chart, 'missing chart');
        throw new Error("There is no 'Hide' method registered with charting.");
    };

    /** */
    return embedding;
});
