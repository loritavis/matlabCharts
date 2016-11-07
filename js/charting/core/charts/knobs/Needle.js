define([], function () {
    "use strict";

    function Needle(x, y, r) {
        // public properties
        this.needleColor = 'blue';
        this.diskColor = 'green';
        this.faceShadow = 'black';
        this.value = 20;

        // public functions
        this.setSize = function (x, y, r) {
            this.centerX = x;
            this.centerY = y;
            this.rTip = r;
            this.rBase = r * 0.45;
            this.rDisk = r * 0.45;

        };

        this.setSize(x, y, r);

        function gradientCircle(context, x, y, r, cTop, cBottom) {
            var gradient = context.createLinearGradient(0, y - r, 0, y + r);
            gradient.addColorStop(0, cTop);
            gradient.addColorStop(1, cBottom);
            context.fillStyle = gradient;
            context.beginPath();
            context.arc(x, y, r, 0, 6.29, false);
            context.fill();
        }

        this.draw = function (context, angle) {
            // the indicator
            var sa = Math.sin(angle);
            var ca = Math.cos(angle);

            // line
            context.beginPath();
            context.moveTo(this.centerX + this.rBase * ca, this.centerY + this.rBase * sa);
            context.lineTo(this.centerX + this.rTip * ca, this.centerY + this.rTip * sa);
            context.strokeStyle = this.needleColor;
            context.lineWidth = 4;
            context.stroke();

            // end balls
            context.beginPath();
            context.moveTo(this.centerX + this.rBase * ca, this.centerY + this.rBase * sa);
            context.arc(this.centerX + this.rBase * ca, this.centerY + this.rBase * sa, 2, 0, 6.29, false);
            context.moveTo(this.centerX + this.rTip * ca, this.centerY + this.rTip * sa);
            context.arc(this.centerX + this.rTip * ca, this.centerY + this.rTip * sa, 2, 0, 6.29, false);
            context.fillStyle = this.needleColor;
            context.fill();

            // the inner ring
            context.shadowColor = this.faceShadow;
            context.shadowBlur = 10;
            context.shadowOffsetX = 2;
            context.shadowOffsetY = 3;

            gradientCircle(context, this.centerX, this.centerY, this.rDisk, this.diskColor, this.diskColor);

            context.shadowBlur = 0;
            context.shadowOffsetX = 0;
            context.shadowOffsetY = 0;
        };

    }

    return Needle;
});

