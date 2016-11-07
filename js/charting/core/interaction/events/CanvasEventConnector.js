/**
 * @module core/interaction/events
 */
define([
    "./XYEvent",
    "./EventCoordinates",
    "./XYConnector",
    "./MouseSupport",
    "./TouchSupport",
    "../../utilities/Really"
], function (XYEvent, EventCoordinates, XYConnector, MouseSupport, TouchSupport, Really) {
    /*jshint strict:false*/

    /**
     * Passes events from canvas to target object.
     *
     * @class CanvasEventConnector
     * @extends EventCoordinates
     * @main
     */
    function CanvasEventConnector(canvas, chart) {
        Really.assert(canvas, 'Missing canvas object');
        Really.assert(chart, 'Missing target object');

        EventCoordinates.call(this, canvas);
        XYConnector.call(this);
        MouseSupport.call(this);
        TouchSupport.call(this);

        this.target = chart;

        this.onmouseup = function (eventIn) {
            if (!this.target.eventHandler){
                return;
            }
            this.mouseIsDown = false;
            this.callHandlerMethod('mouseUpHandler', this.xyEvent(eventIn));
        };

        this.onmousedown = function (eventIn) {
            if (!this.target.eventHandler){
                return;
            }
            var event = this.xyEvent(eventIn);
            this.mouseIsDown = true;
            this.mouseX = event.x;
            this.mouseY = event.y;
            this.callHandlerMethod('mouseDownHandler', event);
        };

        this.ondblclick = function (eventIn) {
            this.callHandlerMethod('doubleClickHandler', this.xyEvent(eventIn));
        };

        this.onmousemove = function (eventIn) {
            if (!this.target.eventHandler){
                return;
            }

            Really.assert(this.target.eventHandler, 'got event without target event handler');
            var event = this.xyEvent(eventIn);

            if (this.mouseIsDown) {
                this.handleMouseDownMove(event);
            } else {
                this.handleMouseMove(event);
            }
        };

        this.addMouseSupport();

        /*
         if (has('touch')) {
         this.addTouchSupport();
         }
         */
    }

    /**
     * Constructs our event object from the platform event
     * @method xyEvent
     * @param event Event from the browser (mouse, touch)
     * @private
     */
    CanvasEventConnector.prototype.xyEvent = function (event) {
        Really.assert(event, 'missing an event');
        return new XYEvent(this.targetCoordinates(event), event.shiftKey, event.button);
    };

    /**
     * Calls handler method without any arguments
     * @method callHandlerMethodPure
     * @param methodName
     * @private
     */
    CanvasEventConnector.prototype.callHandlerMethodPure = function (methodName) {
        Really.assert(this.target.eventHandler, 'got event without target event handler');
        Really.string(methodName, 'expect valid string method name');
        var method = this.target.eventHandler[methodName];
        if (method) {
            method.call(this.target.eventHandler);
        }
    };

    /**
     * Calls handler method with XY event
     * @method callHandlerMethod
     * @private
     * @param methodName
     * @param xyEvent
     */
    CanvasEventConnector.prototype.callHandlerMethod = function (methodName, xyEvent) {
        Really.assert(this.target.eventHandler, 'got event without target event handler');
        Really.string(methodName, 'expect valid string method name');
        Really.assert(xyEvent, 'expect xy event instance');
        var method = this.target.eventHandler[methodName];
        if (method) {
            method.call(this.target.eventHandler, xyEvent);
        }
    };

    /**
     * Calls handler method with XY event and difference with previous position.
     * Updates the mouse X and Y after the call.
     *
     * @method callHandlerMethodWithDelta
     * @private
     * @param methodName
     * @param xyEvent
     */
    CanvasEventConnector.prototype.callHandlerMethodWithDelta = function (methodName, xyEvent) {
        Really.assert(this.target.eventHandler, 'got event without target event handler');
        Really.string(methodName, 'expect valid string method name');
        Really.assert(xyEvent, 'expect xy event instance');
        var method = this.target.eventHandler[methodName];
        if (method) {
            var dx = xyEvent.x - this.mouseX;
            var dy = xyEvent.y - this.mouseY;
            method.call(this.target.eventHandler, xyEvent, dx, dy);
        }
        this.mouseX = xyEvent.x;
        this.mouseY = xyEvent.y;
    };

    CanvasEventConnector.prototype.handleMouseDownMove = function (xyEvent) {
        Really.assert(xyEvent, 'expect an XY event');
        Really.assert(this.target.eventHandler, 'got event without target event handler');

        if (xyEvent.shiftKey) {
            this.callHandlerMethodWithDelta('mouseShiftDragHandler', xyEvent);
        } else {
            this.callHandlerMethodWithDelta('mouseDragHandler', xyEvent);
        }
    };

    CanvasEventConnector.prototype.handleMouseMove = function (xyEvent) {
        Really.assert(xyEvent, 'expect an XY event');

        if (xyEvent.shiftKey) {
            this.callHandlerMethod('mouseShiftMotionHandler', xyEvent);
        } else {
            this.callHandlerMethod('mouseMotionHandler', xyEvent);
        }
    };

    CanvasEventConnector.prototype.addMouseSupport = function () {
        Really.assert(this.canvas, 'cannot find canvas object');

        this.canvas.onmouseup = this.onmouseup.bind(this);
        this.canvas.onmousedown = this.onmousedown.bind(this);
        this.canvas.ondblclick = this.ondblclick.bind(this);
        this.canvas.onmousemove = this.onmousemove.bind(this);
    };

    CanvasEventConnector.prototype.ontouchstart = function (touchEvent) {
        // todo why touchEvent.touches vs touchEvent.event.touches?
        if (touchEvent.touches.length === 1) {
            touchEvent.preventDefault();
            var touch = touchEvent.touches[0];
            var event = this.xyEvent(touch);

            this.inherited(arguments, [event]);
            this.callHandlerMethod('mouseDownHandler', event);
        } else if (touchEvent.event.touches.length === 2) {
            this.callHandlerMethodPure('zoomStartHandler');
        }
    };

    CanvasEventConnector.prototype.ontouchend = function (event) {
        if (event.touches.length === 0) {
            this.inherited(arguments);
            this.callHandlerMethodPure('mouseUpHandler');
        }
    };

    CanvasEventConnector.prototype.ontouchmove = function (eventIn) {
        if (eventIn.touches.length !== 1) {
            return;
        }
        console.assert(this.target.eventHandler, 'null event handler');

        eventIn.preventDefault();
        var event = this.xyEvent(eventIn.touches[0]);
        if (this.mouseIsDown) {
            if (event.shiftKey) {
                this.callHandlerMethodWithDelta('mouseShiftDragHandler', event);
            } else {
                this.callHandlerMethodWithDelta('mouseDragHandler', event);
            }
        } else {
            if (event.shiftKey) {
                this.callHandlerMethod('mouseShiftMotionHandler', event);
            } else {
                this.callHandlerMethod('mouseMotionHandler', event);
            }
        }
    };

    CanvasEventConnector.prototype.ongesturechange = function (event) {
        event.preventDefault();
        this.callHandlerMethod('zoomHandler', this.xyEvent(event));
    };

    CanvasEventConnector.prototype.addTouchSupport = function () {
        Really.assert(this.canvas, 'cannot find canvas object');
        this.canvas.ontouchstart = lang.hitch(this, this.ontouchstart);
        this.canvas.ontouchend = lang.hitch(this, this.ontouchend);
        this.canvas.ontouchmove = lang.hitch(this, this.ontouchmove);
        this.canvas.ongesturechange = lang.hitch(this, this.ongesturechange);
    };

    return CanvasEventConnector;
});