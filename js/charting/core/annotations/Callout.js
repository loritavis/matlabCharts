define([
    "../utilities/Really"
], function (Really) {
    "use strict";

    function CallOut(xAnchor, yAnchor, text) {
        Really.func(xAnchor, 'xAnchor should be a function');
        Really.func(yAnchor, 'yAnchor should be a function');

        this.layer = 'front';
        this.textColor = 'black';
        this.lineColor = 'black';
        this.text = text;

        this.draw = function (context) {
            var x = xAnchor();
            var y = yAnchor();
            var y2 = 0.5 + Math.round(y - 30);
            context.beginPath();
            context.moveTo(x, y);
            context.lineTo(x + 30, y2);
            context.lineTo(x + 50, y2);

            context.strokeStyle = this.lineColor;
            context.stroke();

            context.fillStyle = this.textColor;
            context.textAlign = 'left';
            context.textBaseline = 'middle';
            context.fillText(this.text, x + 53, y2);
        };

        Object.seal(this);
    }

    return CallOut;
});
