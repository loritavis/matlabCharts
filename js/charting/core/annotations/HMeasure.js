define([
    "../utilities/Really"
], function (Really) {
    "use strict";

    function HMeasure(x1Anchor, y1Anchor, x2Anchor, y2Anchor, text) {
        Really.func(x1Anchor, 'x1Anchor should be a function');
        Really.func(y1Anchor, 'y1Anchor should be a function');
        Really.func(x2Anchor, 'x2Anchor should be a function');
        Really.func(y2Anchor, 'y2Anchor should be a function');

        this.layer = "front";
        this.color = "black";
        this.font = "14px serif";
        this.text = text;

        function arrow(context, xTail, yTail, xHead, yHead) {
            var dAngle = Math.PI / 12;
            var headLength = 8;
            var angle = Math.atan2(yHead - yTail, xHead - xTail);

            context.moveTo(xTail, yTail);
            context.lineTo(xHead, yHead);

            var a2 = angle + dAngle;
            context.lineTo(xHead - headLength * Math.cos(a2), yHead + headLength * Math.sin(a2));

            a2 = angle - dAngle;
            context.moveTo(xHead, yHead);
            context.lineTo(xHead - headLength * Math.cos(a2), yHead + headLength * Math.sin(a2));
        }

        this.draw = function (context) {
            var x1 = x1Anchor();
            var y1 = y1Anchor();
            var x2 = x2Anchor();
            var y2 = y2Anchor();
            var gap = x2 - x1;
            var top = Math.min(y1, y2) - 60;
            var baseline = 0.5 + Math.floor(top + 10);

            context.font = this.font;
            var metrics = context.measureText(text);
            var textStart, textEnd;
            // vertical lines
            context.beginPath();
            context.moveTo(x1, y1 - 10);
            context.lineTo(x1, top);
            context.moveTo(x2, y2 - 10);
            context.lineTo(x2, top);

            if (gap > metrics.width + 20) {
                textStart = x1 + gap / 2 - metrics.width / 2 - 2;
                textEnd = textStart + metrics.width + 4;
                arrow(context, textStart, baseline, x1 + 2, baseline);
                arrow(context, textEnd, baseline, x2 - 2, baseline);
            } else {
                textStart = x1 - 28 - metrics.width;
                arrow(context, x1 - 22, baseline, x1, baseline);
                arrow(context, x2 + 22, baseline, x2, baseline);
            }

            context.strokeStyle = this.color;
            context.stroke();

            // draw the text
            context.fillStyle = this.color;
            context.textAlign = "left";
            context.textBaseline = "middle";
            context.fillText(this.text, textStart + 2, baseline);
        };

        Object.seal(this);
    }

    return HMeasure;
});
