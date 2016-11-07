/**
 * @module core/utilities
 */
define([
    "./../utilities/Mapper"
], function (Mapper) {
    "use strict";

    function _MATLABDateToJSDate(mlDate) {
        // fractional part is truncated, so lets get it as right as we can
        return Math.round((mlDate - 719529) * 1000 * 60 * 60 * 24);
    }

    function _JSDateToMATLABDate(jsDate) {
        return jsDate / (1000 * 60 * 60 * 24) + 719529;
    }

    function round(lowest, step, roundUp) {
        // round a value up or down to the nearest "step"
        var rounded;

        if (roundUp) {
            rounded = step * Math.ceil(lowest / step);
        } else {
            rounded = step * Math.floor(lowest / step);
        }

        return rounded;
    }

    function truncateYears(date, step, roundUp) {
        var lowestYear = date.getUTCFullYear();
        lowestYear = round(lowestYear, step, roundUp);
        date.setUTCHours(0, 0, 0, 0);
        date.setUTCFullYear(lowestYear, 0, 1);
    }

    function truncateMonths(date, step, roundUp) {
        var lowestMonth = date.getUTCMonth();
        lowestMonth = round(lowestMonth, step, roundUp);
        date.setUTCHours(0, 0, 0, 0);
        date.setUTCMonth(lowestMonth, 1);
    }

    function truncateDays(date, step, roundUp) {
        var lowestDay = date.getUTCDate();
        lowestDay = 1 + round(lowestDay, step, roundUp);
        date.setUTCHours(0, 0, 0, 0);
        date.setUTCDate(lowestDay);
    }

    function truncateHours(date, step, roundUp) {
        var lowestHour = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
        lowestHour = round(lowestHour, step, roundUp);
        date.setUTCHours(lowestHour, 0, 0, 0);
    }

    function truncateMinutes(date, step, roundUp) {
        var lowestMinute = date.getUTCMinutes();
        lowestMinute = round(1 + lowestMinute, step, roundUp);
        date.setUTCMinutes(lowestMinute, 0, 0);
    }

    function truncateSeconds(date, step, roundUp) {
        var lowestSecond = date.getUTCSeconds();
        lowestSecond = round(1 + lowestSecond, step, roundUp);
        date.setUTCSeconds(lowestSecond, 0);
    }

    function truncateMilliseconds(date, step, roundUp) {
        var lowestMsec = date.getUTCMilliseconds();
        lowestMsec = round(1 + lowestMsec, step, roundUp);
        date.setUTCMilliseconds(lowestMsec);
    }


    function niceYearSpacing(n, lower, upper) {
        var spacing = 1;
        while (true) {
            var count = n / spacing;
            if (count < upper) {
                return spacing;
            }
            if (count > 5 * lower && count < 5 * upper) {
                return 5 * spacing;
            }
            if (count > 2 * lower && count < 2 * upper) {
                return 2 * spacing;
            }
            if (count > 3 * lower && count < 3 * upper) {
                return 3 * spacing;
            }
            spacing = spacing * 10;
        }
    }

    function niceMillisecondSpacing(timeRange, minTicks) {
        // find a step size that works
        var seconds = timeRange * 24 * 60 * 60;
        var step = 1;
        while (seconds / step < minTicks) {
            if (2 * seconds / step > minTicks) {
                step = step / 2;
                break;
            }
            if (5 * seconds / step > minTicks) {
                step = step / 5;
                break;
            }
            step = step / 10;
        }

        // Convert to Milliseconds
        // maximum resolution for dates is one millisecond.
        return Math.max(1, step * 1000);
    }

    // Here we decide how many ticks we should pick for "nice" spacing.
    // the policy here is that ticks should be between 60 and 120 pixels apart.
    function nTickRange(screenRange) {
        var width = screenRange[1] - screenRange[0];
        var tixmin = width / 120;
        if (tixmin < 1) {
            tixmin = 1;
        }

        // no less than 40 pixels apart
        var tixmax = width / 60;
        if (tixmax < 2) {
            tixmax = 2;
        }
        return [tixmin, tixmax];
    }

    var monthNames = new Array(12);
    monthNames[0] = "January";
    monthNames[1] = "February";
    monthNames[2] = "March";
    monthNames[3] = "April";
    monthNames[4] = "May";
    monthNames[5] = "June";
    monthNames[6] = "July";
    monthNames[7] = "August";
    monthNames[8] = "September";
    monthNames[9] = "October";
    monthNames[10] = "November";
    monthNames[11] = "December";

    function dateMapper(units) {
        var date = new Date();

        function map(mlDate) {
            date.setTime(_MATLABDateToJSDate(mlDate));
            var m, h, mth, y;
//                console.log(date);

            var ms = date.getMilliseconds();
            if (ms !== 0) {
                return ms.toString() + "ms";
            }

            var s = date.getSeconds();
            if (s !== 0) {
                if (units === "s") {
                    return s.toString() + "sec";
                }
                m = date.getMinutes();
                h = date.getUTCHours();
                if (s < 10) {
                    s = "0" + s;
                }
                if (m < 10) {
                    m = "0" + m;
                }
                return h + ":" + m + ":" + s;
            }

            m = date.getMinutes();
            h = date.getUTCHours();
            // format HH:MM correctly for one digit minutes
            if (h !== 0 || m !== 0) {
                if (m < 10) {
                    m = "0" + m;
                }
                return h + ":" + m;
            }

            var d = date.getUTCDate();
            if (d !== 1) {
                // 1st, 2nd, 3rd, 4th 5th ...
                var suffix = "th";
                if (d === 1 || d === 21) {
                    suffix = "st";
                } else if (d === 2 || d === 22) {
                    suffix = "nd";
                } else if (d === 3 || d === 23) {
                    suffix = "rd";
                }

                if (units === "d") {
                    return d.toString() + suffix;
                }
                y = date.getUTCFullYear();
                mth = date.getUTCMonth();

                return monthNames[mth] + " " + d.toString() + suffix + " " + y.toString();
            }

            mth = date.getUTCMonth();
            if (mth !== 0) {
                return monthNames[mth];
            }

            y = date.getUTCFullYear();
            return y.toString();
        }

        return {map: map, length: NaN};
    }

    function makeTicks(date, endDate, tickSpacing) {
        var spacing = tickSpacing.spacing;

        // Make array of tick values from start to end
        var ticks = [];
        while (date.valueOf() <= endDate.valueOf()) {
            ticks.push(_JSDateToMATLABDate(date.valueOf()));
            // move to the next unit
            switch (tickSpacing.units) {
            case "y":
                date.setUTCFullYear(date.getUTCFullYear() + spacing);
                break;
            case "m":
                date.setUTCMonth(date.getUTCMonth() + spacing);
                break;
            case "d":
                date.setUTCDate(date.getUTCDate() + spacing);
                break;
            case "h":
                date.setUTCHours(date.getUTCHours() + spacing);
                break;
            case "mn":
                date.setUTCMinutes(date.getUTCMinutes() + spacing);
                break;
            case "s":
                date.setUTCSeconds(date.getUTCSeconds() + spacing);
                break;
            case "ms":
                date.setUTCMilliseconds(date.getUTCMilliseconds() + spacing);
                break;
            }
        }

        return ticks;
    }

    function chooseTickSpacing(screenRange, dataRange) {
        var tickPolicy = [
            [ 1, "y", 365],
            [ 6, "m", 180],
            [ 3, "m", 90],
            [ 1, "m", 30],
            [15, "d", 15],
            [ 5, "d", 5],
            [ 2, "d", 2],
            [ 1, "d", 1],
            [12, "h", 1 / 2],
            [ 6, "h", 1 / 4],
            [ 2, "h", 1 / 12],
            [ 1, "h", 1 / 24],
            [30, "mn", 1 / (2 * 24)],
            [15, "mn", 1 / (4 * 24)],
            [ 5, "mn", 1 / (12 * 24)],
            [ 2, "mn", 1 / (30 * 24)],
            [ 1, "mn", 1 / (60 * 24)],
            [30, "s", 1 / (2 * 60 * 24)],
            [15, "s", 1 / (4 * 60 * 24)],
            [ 5, "s", 1 / (12 * 60 * 24)],
            [ 2, "s", 1 / (30 * 60 * 24)],
            [ 1, "s", 1 / (60 * 60 * 24)]
        ];

        var timeRange = dataRange[1] - dataRange[0];
        var nTicks = nTickRange(screenRange);
        var minTicks = nTicks[0];
        var maxTicks = nTicks[1];

        // calculate the units and step size we will use
        var tickSpacing = 0;
        var units;
        var i;

        // Are we above the table?
        var nYears = timeRange / 365;
        if (nYears > maxTicks) { // if there are too many years, we skip some
            tickSpacing = niceYearSpacing(nYears, minTicks, maxTicks);
            units = "y";
        } else {
            // are we in the table?
            for (i = 0; i < tickPolicy.length; i += 1) {
                var entry = tickPolicy[i];
                var daysPerStep = entry[2];
                if (timeRange / daysPerStep > minTicks) {
                    tickSpacing = entry[0];
                    units = entry[1];
                    break;
                }
            }
            // or are we below the table ?
            if (tickSpacing === 0) {
                tickSpacing = niceMillisecondSpacing(timeRange, minTicks);
                units = "ms";
            }
        }

        return {
            units: units,
            spacing: tickSpacing
        };
    }

    // round dates to desired spacing
    function roundDates(startDate, endDate, tickSpacing, exact) {
        var spacing = tickSpacing.spacing;
        switch (tickSpacing.units) {
        case "y":
            truncateYears(startDate, spacing, exact);
            truncateYears(endDate, spacing, !exact);
            break;
        case "m":
            truncateMonths(startDate, spacing, exact);
            truncateMonths(endDate, spacing, !exact);
            break;
        case "d":
            truncateDays(startDate, spacing, exact);
            truncateDays(endDate, spacing, !exact);
            break;
        case "h":
            truncateHours(startDate, spacing, exact);
            truncateHours(endDate, spacing, !exact);
            break;
        case "mn":
            truncateMinutes(startDate, spacing, exact);
            truncateMinutes(endDate, spacing, !exact);
            break;
        case "s":
            truncateSeconds(startDate, spacing, exact);
            truncateSeconds(endDate, spacing, !exact);
            break;
        case "ms":
            truncateMilliseconds(startDate, spacing, exact);
            truncateMilliseconds(endDate, spacing, !exact);
            break;
        }
    }

    /**
     dateTickPicker will return an object with four fields:
     values is a mapper that maps indices to tick values
     labels maps indices to tick labels
     dataToScreenMapper maps data values to screen coordinates
     dataToStringMapper maps data values to strings

     @class dateTickPicker
     */
    function dateTickPicker(screenRange, dataRange, matchDataLimits) {
        var startDate = new Date(_MATLABDateToJSDate(dataRange[0]));
        var endDate = new Date(_MATLABDateToJSDate(dataRange[1]));

        // how far apart are the ticks to be in data space?
        var tickSpacing = chooseTickSpacing(screenRange, dataRange);
        roundDates(startDate, endDate, tickSpacing, matchDataLimits);

        var tickValues = makeTicks(startDate, endDate, tickSpacing);

        var actualRange;
        if (matchDataLimits) {
            actualRange = dataRange;
        } else {
            actualRange = [tickValues[0], tickValues[tickValues.length - 1]];
        }

        return {
            values: Mapper.Index(tickValues),
            labels: Mapper.Compound(Mapper.Index(tickValues), dateMapper(tickSpacing.units)),
            dataToStringMapper: dateMapper(tickSpacing.units),
            dataToScreenMapper: Mapper.Range(actualRange[0], actualRange[1], screenRange[0],
                    screenRange[1])
        };
    }

    return dateTickPicker;
});