/**
 * @module core/utilities
 */
define(["./DateTickPicker", "../utilities/Mapper"], function (pickDateTicks, Mapper) {
    "use strict";

    function findTickDelta(lower, upper, width) {
        // find the spacing between ticks in data units
        // lower and upper are the data bounds
        // width is the number of pixels the ruler is to span

        // how many ticks should there be?

        // no more than 80 pixels apart
        var tixmin = width / 80;
        if (tixmin < 1) {
            tixmin = 1;
        }

        // no less than 40 pixels apart
        var tixmax = width / 40;
        if (tixmax < 2) {
            tixmax = 2;
        }

        // What is the range that tick spacing could take?
        var range = Math.abs(upper - lower);
        var deltamax = range / tixmin;
        var deltamin = range / tixmax;

        var factor = 1.0;

        // get onto the interval 1 < max < 10
        while ((factor * deltamax) < 1.0) {
            factor *= 10.0;
        }

        while ((factor * deltamax) > 10.0) {
            factor /= 10.0;
        }

        var dmax = deltamax * factor;
        var dmin = deltamin * factor;

        var dataTickDelta = 1;
        // choose the tick interval
        if ((1 >= dmin) && (1 <= dmax)) {
            dataTickDelta = 1 / factor;
        } else if ((5 >= dmin) && (5 <= dmax)) {
            dataTickDelta = 5 / factor;
        } else if ((2 >= dmin) && (2 <= dmax)) {
            dataTickDelta = 2 / factor;
        } else if ((3 >= dmin) && (3 <= dmax)) {
            dataTickDelta = 3 / factor;
        }

        return dataTickDelta;
    }

    function pickTickValues(screenRange, dataRange, encloseData) {
        var dataMin = dataRange[0];
        var dataMax = dataRange[1];
        var minTick;
        var maxTick;

        var dataTickDelta = findTickDelta(dataMin, dataMax,
                Math.abs(screenRange[1] - screenRange[0]));

        // find the end points
        if (encloseData) {
            minTick = dataTickDelta * Math.floor(dataMin / dataTickDelta);
            maxTick = dataTickDelta * Math.ceil(dataMax / dataTickDelta);
        } else {
            minTick = dataTickDelta * Math.ceil(dataMin / dataTickDelta);
            maxTick = dataTickDelta * Math.floor(dataMax / dataTickDelta);
        }

        // make the ticks array
        var myTicks = [];
        myTicks.push(minTick);

        var data = minTick;
        while (data < maxTick) {
            data += dataTickDelta;
            myTicks.push(data);
        }

        return myTicks;
    }

    function pickNumberTicks(screenRange, dataRange, encloseData) {
        var tickValues = pickTickValues(screenRange, dataRange, encloseData);
        var values = Mapper.Index(tickValues);

        // We want to show just enough digits to the right of the decimal point to
        // distinguish the tick values
        var stepSize = tickValues[1] - tickValues[0];
        // Javascript doesn't have log10, so here is another way to calculate it
        var digits = Math.log(stepSize) / Math.LN10;
        digits = Math.max(0, Math.min(20, Math.ceil(-digits)));

        var labels = Mapper.Compound(values, Mapper.String(digits));

        var actualRange;
        if (encloseData) {
            actualRange = [tickValues[0], tickValues[tickValues.length - 1]];
        } else {
            actualRange = dataRange;
        }

        var dataToScreenMapper = Mapper.Range(actualRange[0], actualRange[1], screenRange[0],
                screenRange[1]);
        var dataToStringMapper = Mapper.String(digits);

        return {
            values: values,
            labels: labels,
            dataToScreenMapper: dataToScreenMapper,
            dataToStringMapper: dataToStringMapper
        };
    }

    /**
     Pick ticks will return an object with four fields:
     values is a mapper that maps indices to tick values
     labels maps indices to tick labels
     dataToScreenMapper maps data values to screen coordinates
     dataToStringMapper maps data values to strings

     @class pickTicks
     */
    function pickTicks(screenRange, data, dataIsTime, encloseData) {

        if (undefined === encloseData) {
            encloseData = true;
        }

        if (dataIsTime) {
            return pickDateTicks(screenRange, data, !encloseData);
        }

        return pickNumberTicks(screenRange, data, encloseData);

        /* once rulers get table columns..
         if (data.units === "date") {
         return pickDateTicks(screenRange, data.getDataRange(), !encloseData);
         } else {
         return pickNumberTicks(screenRange, data.getDataRange(), !encloseData);
         }
         */
    }

    return pickTicks;
});