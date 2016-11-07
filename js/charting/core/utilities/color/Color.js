/**
 * @module core/utilities/color
 */
define([
    "./ColorSpace",
    "../Arrays",
    "../Mapper",
    "../Really"
], function (ColorSpace, arrays, Map, Really) {
    "use strict";

    /**
     Color utility
     @class Color
     */
    var color = {};

    color.randomColor = function (nColors) {
        var colors = [];
        if (nColors) {
            var i;
            for (i = 0; i < nColors; i += 1) {
                colors[i] = color.randomColor();
            }
        } else {
            var r = Math.round(200 * Math.random());
            var g = Math.round(200 * Math.random());
            var b = Math.round(200 * Math.random());
            var a = 1;
            // a = 0.4 + 0.6 * Math.random();
            colors = 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
        }
        return colors;
    };

    // Parse the usual javascript color strings into rgb vectors.
    // this doesn't work on named colors ('red')
    color.parseColor = function (colorIn) {
        if (Array.isArray(colorIn)) {
            if (colorIn.length === 3) {
                return colorIn;
            }
            return colorIn.slice(0, 3);
        }
        var BAD_COLOR = [0.4, 1, 0.6];
        var match, thisColor;
        thisColor = colorIn.replace(/\s\s*/g, '');
        if ((/^#([\da-fA-F]{2})([\da-fA-F]{2})([\da-fA-F]{2})/.test(thisColor))) {
            match = /^#([\da-fA-F]{2})([\da-fA-F]{2})([\da-fA-F]{2})/.exec(thisColor);
            return [parseInt(match[1], 16), parseInt(match[2], 16), parseInt(match[3], 16)];
        }
        if (/^#([\da-fA-F])([\da-fA-F])([\da-fA-F])/.test(thisColor)) {
            match = /^#([\da-fA-F])([\da-fA-F])([\da-fA-F])/.exec(thisColor);
            return [parseInt(match[1], 16) * 17, parseInt(match[2],
                    16) * 17, parseInt(match[3], 16) * 17];
        }
        if (/^rgba\(([\d]+),([\d]+),([\d]+),([\d]+|[\d]*\.[\d]+)\)/.test(thisColor)) {
            match = /^rgba\(([\d]+),([\d]+),([\d]+),([\d]+|[\d]*\.[\d]+)\)/.exec(thisColor);
            return [+match[1], +match[2], +match[3], +match[4]];
        }
        if (/^rgb\(([\d]+),([\d]+),([\d]+)\)/.test(thisColor)) {
            match = /^rgb\(([\d]+),([\d]+),([\d]+)\)/.exec(thisColor);
            return [+match[1], +match[2], +match[3]];
        }
        if (thisColor === 'black') {
            return [0, 0, 0];
        }
        if (thisColor === 'white') {
            return [255, 255, 255];
        }
        // console.log('ParseColor cant parse ' + color);
        return BAD_COLOR;
    };

    // checks if each element of the given triple RGB color array is range [0, 255]
    color.isInRange = function (color) {
        if (typeof color === "string") {
            if (color.indexOf("-") !== -1) {
                // rgb(...) or rgba(...) should not contain negative numbers
                return false;
            }
            color = this.parseColor(color);
        }
        Really.assert(Array.isArray(color), "color argument", color, "is not an array");
        Really.assert(color.length >= 3, "color argument", color,
                "has fewer than 3 channels");

        var k;
        for (k = 0; k < 3; k += 1) {
            if (color[k] < 0 || color[k] > 255) {
                return false;
            }
        }
        return true;
    };

    // Should we replicate many of the MATLAB colormaps here?
    color.jet = [
        [0.5, 0, 0],
        [1, 0, 0],
        [1, 0.5, 0],
        [1, 1, 0],
        [0.5, 1, 0],
        [0, 1, 1],
        [0, 0.5, 1],
        [0, 0, 1],
        [0, 0, 0.5]
    ];

    color.gray = [
        [0, 0, 0],
        [1, 1, 1]
    ];

    color.bone = [
        [0, 0, 0],
        [0.44, 0.32, 0.32],
        [0.78, 0.78, 0.65],
        [1, 1, 1]
    ];

    // A MathWorks-designed proprietary colormap
    color.parula = [
        [0.208, 0.166, 0.529],
        [0.212, 0.190, 0.577],
        [0.212, 0.213, 0.626],
        [0.208, 0.238, 0.675],
        [0.197, 0.263, 0.726],
        [0.173, 0.290, 0.776],
        [0.130, 0.322, 0.827],
        [0.065, 0.357, 0.866],
        [0.014, 0.385, 0.881],
        [0.005, 0.407, 0.883],
        [0.015, 0.425, 0.879],
        [0.031, 0.441, 0.873],
        [0.048, 0.456, 0.865],
        [0.061, 0.471, 0.857],
        [0.071, 0.486, 0.848],
        [0.077, 0.501, 0.840],
        [0.080, 0.517, 0.832],
        [0.076, 0.534, 0.827],
        [0.067, 0.553, 0.824],
        [0.052, 0.573, 0.823],
        [0.037, 0.592, 0.821],
        [0.028, 0.610, 0.815],
        [0.024, 0.625, 0.807],
        [0.023, 0.638, 0.795],
        [0.023, 0.650, 0.781],
        [0.025, 0.661, 0.766],
        [0.034, 0.671, 0.749],
        [0.052, 0.681, 0.731],
        [0.075, 0.690, 0.713],
        [0.103, 0.699, 0.693],
        [0.134, 0.707, 0.672],
        [0.167, 0.715, 0.651],
        [0.203, 0.722, 0.628],
        [0.242, 0.729, 0.605],
        [0.284, 0.735, 0.581],
        [0.329, 0.741, 0.557],
        [0.375, 0.745, 0.534],
        [0.422, 0.747, 0.512],
        [0.467, 0.749, 0.492],
        [0.511, 0.749, 0.474],
        [0.552, 0.749, 0.457],
        [0.591, 0.748, 0.441],
        [0.629, 0.747, 0.426],
        [0.665, 0.745, 0.412],
        [0.700, 0.742, 0.398],
        [0.735, 0.740, 0.384],
        [0.768, 0.737, 0.371],
        [0.800, 0.734, 0.357],
        [0.833, 0.732, 0.344],
        [0.864, 0.729, 0.330],
        [0.895, 0.727, 0.316],
        [0.926, 0.726, 0.300],
        [0.957, 0.727, 0.281],
        [0.983, 0.736, 0.257],
        [0.997, 0.752, 0.231],
        [0.999, 0.773, 0.209],
        [0.993, 0.793, 0.191],
        [0.985, 0.813, 0.174],
        [0.976, 0.834, 0.158],
        [0.967, 0.855, 0.142],
        [0.961, 0.877, 0.126],
        [0.959, 0.902, 0.108],
        [0.961, 0.930, 0.090],
        [0.969, 0.960, 0.070]
    ];

    color.map = function (data, colormap) {
        if (!colormap) {
            colormap = color.currentColorTheme.ColorMap;
        }

        var rgbColorToJSColor = Map.funApply(color.rgbToJavaScript);

        return Map.Compound(Map.Map(data, colormap), rgbColorToJSColor);
    };

    // The index rotates through the color order
    color.colorOrder = function () {
        function foo(index) {
            return color.currentColorTheme.ColorOrder[index % 7];
        }

        return {get: foo, length: NaN};
    };

    color.InterpolatingColorMapper = function () {
        this.lower = 0;
        this.upper = 8;
        this.colormap = color.currentColorTheme.ColorMap;

        this.map = function (dataValue) {
            // scaled Value is between 0 and 1
            var scaledValue = (dataValue - this.lower) / (this.upper - this.lower);
            scaledValue = Math.max(0, Math.min(0.9999999, scaledValue));

            // indexed Value is REAL location in a continuous color map array
            var indexedValue = scaledValue * (this.colormap.length - 1);

            var lowerIndex = Math.floor(indexedValue);
            var fraction = indexedValue - lowerIndex;

            var color1 = this.colormap[lowerIndex];
            var color2 = this.colormap[lowerIndex + 1];

            // interpolate a color between color1 and color2
            var r = color1[0] + fraction * (color2[0] - color1[0]);
            var g = color1[1] + fraction * (color2[1] - color1[1]);
            var b = color1[2] + fraction * (color2[2] - color1[2]);
            return [r, g, b];
        };
    };

    color.rgbToJavaScript = function (color) {
        var r = Math.round(255 * color[0]);
        var g = Math.round(255 * color[1]);
        var b = Math.round(255 * color[2]);

        return 'rgb(' + r + ',' + g + ',' + b + ')';
    };

    // Color sources insulate their clients from color generation.
    color.fixedColorSource = function (colorString) {
        return function () {
            return colorString;
        };
    };

    color.indexColorSource = function (upper, colorMap) {
        var colorMapper = new color.InterpolatingColorMapper();
        colorMapper.lower = 0;
        colorMapper.upper = upper;
        if (colorMap !== undefined) {
            colorMapper.colormap = colorMap;
        }

        return function (index) {
            return color.rgbToJavaScript(colorMapper.map(index));
        };
    };

    color.dataColorSource = function (data, colorMap) {
        var colorMapper = new color.InterpolatingColorMapper();
        colorMapper.lower = Arrays.min(data);
        colorMapper.upper = Arrays.max(data);
        if (colorMap !== undefined) {
            colorMapper.colormap = colorMap;
        }

        return function (index) {
            return color.rgbToJavaScript(colorMapper.map(data[index]));
        };
    };

    // find a color part way between two colors
    color.mixColor = ColorSpace.linearInterpolate;

    color.isRGBA = function (rgbaString) {
        Really.assert(typeof rgbaString === 'string', 'argument should be a string, not',
                rgbaString);
        return rgbaString.indexOf('rgba(') === 0;
    };

    // make a lighter version of a color by converting it to hsl, increasing the luminosity and then
    // converting it to a color string: 'rgb(100,100,100)'.
    color.lighter = function (rgb, ratio) {
        var hsl = ColorSpace.rgbToHsl(rgb[0], rgb[1], rgb[2]);
        var h = hsl[0];
        var s = hsl[1];
        var l = hsl[2];

        l = l + ratio * (1 - l);
        // clamp luminosity
        l = Math.max(0.0, Math.min(l, 1.0));

        var lighterRGB = ColorSpace.hslToRgb(h, s, l);

        var r = Math.round(lighterRGB[0]);
        var g = Math.round(lighterRGB[1]);
        var b = Math.round(lighterRGB[2]);
        return 'rgb(' + r + ',' + g + ',' + b + ')';
    };


    // A color Theme specifies a number of colors for objects to use
    // as initial values.
    // There is a global variable currentColorTheme that objects query.
    color.ThemeA = {
        ColorOrder: [
            'rgb( 18, 104, 179)',
            'rgb(237,  36,  38)',
            'rgb(155, 190,  61)',
            'rgb(123,  45, 116)',
            'rgb(255, 199,   0)',
            'rgb( 77, 190, 238)',
            'rgb(210, 116,   0)'
        ],
        ColorMap: color.parula,
        BackgroundColor: 'rgba(250,250,250,1.0)',
        GridColor: '#4fb',
        LabelColor: '#444'
    };

    color.ThemeB = {
        ColorOrder: [
            'rgb( 18, 104, 179)',
            'rgb(237,  36,  38)',
            'rgb(155, 190,  61)',
            'rgb(123,  45, 116)',
            'rgb(255, 199,   0)',
            'rgb( 77, 190, 238)',
            'rgb(210, 116,   0)'
        ],
        ColorMap: color.jet,
        GridColor: '#4fb',
        LabelColor: '#000',
        BackgroundColor: '#ccf'
    };

    color.currentColorTheme = color.ThemeA;
    Object.seal(color);
    return color;
});
