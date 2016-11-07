define([
    "../utilities/Really"
], function (Really) {
    "use strict";

    function Rectangle(leftAnchor, rightAnchor, topAnchor, bottomAnchor) {
        Really.func(leftAnchor, 'leftAnchor should be a function');
        Really.func(rightAnchor, 'rightAnchor should be a function');
        Really.func(topAnchor, 'topAnchor should be a function');
        Really.func(bottomAnchor, 'bottomAnchor should be a function');

        this.layer = 'back';
        this.fillColor = '#DDF';

        this.draw = function (context) {
            var left = leftAnchor();
            var right = rightAnchor();
            var top = topAnchor();
            var bottom = bottomAnchor();

            if (this.fillColor) {
                context.fillStyle = this.fillColor;
                var y = Math.min(top, bottom);
                var width = right - left;
                var height = Math.abs(bottom - top);
                context.fillRect(left, y, width, height);
            }

        };

        Object.seal(this);
    }

    return Rectangle;
});
