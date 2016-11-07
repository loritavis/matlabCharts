/**
 * @module core/utilities/color
 */
define([], function () {
    "use strict";

    /**
     Color space utility methods
     @class ColorSpace
     */

    // Do we really need to write our own color space conversions?
    // Why not use existing library, for example https://github.com/One-com/one-color

    // todo What are the argument range?
    // is this same as https://gist.github.com/1034818 just refactored?

    /**
     @method hue2rgb
     @public
     */
    function hue2rgb(p, q, t) {
        if (t < 0) {
            t += 1;
        }
        if (t > 1) {
            t -= 1;
        }
        if (t < 1 / 6) {
            return p + (q - p) * 6 * t;
        }
        if (t < 1 / 2) {
            return q;
        }
        if (t < 2 / 3) {
            return p + (q - p) * (2 / 3 - t) * 6;
        }
        return p;
    }

    /**
     @method hsl2rgb
     @public
     */
    function hslToRgb(h, s, l) {
        var r, g, b;

        if (s === 0) {

            r = g = b = l;

        } else {
            var q;
            if (l < 0.5) {
                q = l * (1 + s);
            } else {
                q = l + s - l * s;
            }

            var p = 2 * l - q;

            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }


    /**
     @method rgb2Hsl
     @public
     */
    function rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
            }
            h /= 6;
        }

        return [h, s, l];
    }

    /**
     @method linearInterpolate
     @public
     */
    function linearInterpolate(r1, g1, b1, a1, r2, g2, b2, a2, min, value, max) {
        var fraction = (value - min) / (max - min);
        var r, g, b, a;

        if (fraction < 0) {
            r = r1;
            g = g1;
            b = b1;
            a = a1;
        } else if (fraction > 1) {
            r = r2;
            g = g2;
            b = b2;
            a = a2;
        } else {
            r = Math.round(r1 + fraction * (r2 - r1));
            g = Math.round(g1 + fraction * (g2 - g1));
            b = Math.round(b1 + fraction * (b2 - b1));
            a = a1 + fraction * (a2 - a1);
        }
        return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
    }

    return {
        hue2rgb: hue2rgb,
        hslToRgb: hslToRgb,
        rgbToHsl: rgbToHsl,
        linearInterpolate: linearInterpolate
    };
});