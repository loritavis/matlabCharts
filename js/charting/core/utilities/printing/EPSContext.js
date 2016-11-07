define([
    "../color/Color",
    "../Really",
    "dojo/has!dom?dojo/domReady"
], function (Color, Really, ready) {
    "use strict";
    // this is an object with the same API as the canvas 2d context.
    // it spits out EPS
    var printContext = {};

    // default values for properties
    printContext.textAlign = 'unset';
    printContext.textBaseline = 'unset';
    printContext.shadowBlur = 0;
    printContext.shadowOffsetX = 0;
    printContext.shadowOffsetY = 0;

    //we store a real context at init time so we can use it to measure text.
    var backupContext = null;

    if (ready) {
        ready(function () {
            if (undefined !== document) {
                var newCanvas = document.createElement('canvas');
                newCanvas.height = 1;
                newCanvas.width = 1;
                newCanvas.setAttribute("style", "display:none;");
                document.body.appendChild(newCanvas);
                backupContext = newCanvas.getContext('2d');
                Really.assert(backupContext, 'eps context, null backup context');
            }
        });
    }

    var height;
    var currentFont = '';
    var currentFontSize = 0;
    var scale = 1.0;

    var output;

    // local variables storing properties
    var currentColor = null;
    var strokeStyle = null;
    var fillStyle = null;
    var font;
    var lineWidth = null;

    function emit(str) {
        output.push(str);
    }

    function makePosition(x, y) {
        // Canvas and Postscript have opposite directions for y, so we fix that here.
        var sy = height - y;

        if (isNaN(x)) {
            x = 0;
        }
        if (isNaN(sy)) {
            sy = 0;
        }
        return x.toPrecision(5) + ' ' + sy.toPrecision(5);
    }

    function display(fName, args) {
        var i;
        var str = fName + ' ';
        for (i = 0; i < args.length; i += 1) {
            str = str + args[i] + ' ';
        }
        console.log('%%' + str);
    }

    Object.defineProperty(printContext, "strokeStyle", {
        get: function () {
            return strokeStyle;
        },
        set: function (newValue) {
            strokeStyle = newValue;
        }
    });

    Object.defineProperty(printContext, "fillStyle", {
        get: function () {
            return fillStyle;
        },
        set: function (newValue) {
            fillStyle = newValue;
        }
    });

    Object.defineProperty(printContext, "font", {
        get: function () {
            return font;
        },
        set: function (newValue) {
            font = newValue;
            backupContext.font = font;
            this.setFont();
        }
    });

    Object.defineProperty(printContext, "lineWidth", {
        get: function () {
            return lineWidth;
        },
        set: function (newValue) {
            lineWidth = newValue;
            emit(this.lineWidth + ' setlinewidth');
        }
    });

    printContext.init = function (width, height) {
        Really.assert(width > 0, 'invalid print context width', width);
        Really.assert(height > 0, 'invalid print context height', height);
        this.height = height;

        output = [];

        emit('%!PS-Adobe-3.0 EPSF-3.0');
        emit('%%BoundingBox: 0 0 ' + (width * 0.72) + ' ' + (height * 0.72));

        emit('/showleft    { moveto show} def');
        emit('/aligncenter { dup stringwidth      pop -2 div 0 rmoveto } def ');
        emit('/alignright  { dup stringwidth      pop -1 mul 0 rmoveto } def ');

        emit('0.72 0.72 scale % incoming positions are in 1/100ths of an inch (pixels)');
        emit('');
    };

    printContext.destroy = function () {
        backupContext = 0;
        output = [];
    };

    printContext.moveTo = function (x, y) {
        var position = makePosition(x, y);
        emit(position + ' moveto');
    };

    printContext.translate = function (x, y) {
        var position = makePosition(x, y);
        emit(position + ' translate');
    };

    printContext.rotate = function (angle) {
        emit(angle.toPrecision(5) + ' rotate');
    };

    printContext.lineTo = function (x, y) {
        var position = makePosition(x, y);
        emit(position + ' lineto');
    };

    printContext.stroke = function () {
        printContext.setColor(strokeStyle);
        emit('stroke');
        emit('');
    };

    printContext.fill = function () {
        printContext.setColor(fillStyle);
        emit('fill');
        emit('');
    };

    printContext.clip = function () {
        display('clip ignored', arguments);
    };

    printContext.arc = function (x, y, r, a1, a2) {
        var position = makePosition(x, y);
        emit(position + ' ' + r * scale + ' ' + a1 * (-180 / 3.1415) + ' ' + a2 * (-180 / 3.1415) + ' arcn');
    };

    printContext.beginPath = function () {
        emit('newpath');
    };

    printContext.fillText = function (t, x, y) {
        this.setColor(this.fillStyle);
        this.moveTo(x, y);

        emit('(' + t + ')');

        if (this.textAlign === 'center') {
            emit('aligncenter');
        } else if (this.textAlign === 'right') {
            emit('alignright');
        }

        if (this.textBaseline === 'middle') {
            emit('0 ' + (-currentFontSize / 2.7).toPrecision(5) + ' rmoveto');
        } else if (this.textBaseline === 'top') {
            emit('0 ' + -currentFontSize + ' rmoveto');
        }
        emit('show');
        emit('');
    };

    printContext.fillRect = function (x, y, w, h) {
        Really.assert(Array.isArray(output), 'null eps output, have you initialized eps context?');
        this.beginPath();
        this.moveTo(x, y);
        this.lineTo(x + w, y);
        this.lineTo(x + w, y + h);
        this.lineTo(x, y + h);
        this.lineTo(x, y);
        this.fill();
    };

    printContext.strokeRect = function (x, y, w, h) {
        this.beginPath();
        this.moveTo(x, y);
        this.lineTo(x + w, y);
        this.lineTo(x + w, y + h);
        this.lineTo(x, y + h);
        emit(' closepath');
        this.stroke();
    };

    printContext.save = function () {
        emit('save');
    };

    printContext.restore = function () {
        emit('restore');
    };

    printContext.setFont = function () {
        if (currentFont !== this.font) {
            var match = /^([\d]+)px*/.exec(this.font);
            currentFontSize = match[1];
            emit('/Times-Roman findfont');
            emit(currentFontSize + ' scalefont');
            emit('setfont');
            emit('');
            currentFont = this.font;
        }
    };

    printContext.setColor = function (color) {
        if (currentColor !== color) {
            var rgb = Color.parseColor(color);
            emit((rgb[0] / 255).toFixed(3) + ' ' + (rgb[1] / 255).toFixed(3) + ' ' + (rgb[2] / 255).toFixed(3) + ' setrgbcolor');
            currentColor = color;
        }
    };

    printContext.measureText = function (string) {
        Really.assert(backupContext, 'missing text measuring object');
        return backupContext.measureText(string);
    };

    // returns final EPS text
    printContext.getText = function () {
        Really.assert(output, 'eps output exists');
        Really.assert(Array.isArray(output), 'eps output is an array');
        return output.join('\n');
    };

    // Object.seal(printContext);
    return printContext;
});
